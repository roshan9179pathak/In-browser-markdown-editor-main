// variables
const editorContainer = document.querySelector(".editor-container");
const hamburgerButton = document.querySelector(".hamburger-button");
const documentName = document.querySelector(".document-name");
const documentId = document.querySelector(".document-id");
const downloadButton = document.querySelector(".download-button");
const eyeIcon = document.querySelector(".eye");
const eyeCrossedIcon = document.querySelector(".eye-crossed");
const markdownContainer = document.querySelector(".markdown-container");
const previewContainer = document.querySelector(".preview-container");
const markdownSection = document.querySelector(".markdown-section");
const previewSection = document.querySelector(".preview-section");
const slidingMenu = document.querySelector(".sliding-menu");
const closeMenuButton = document.querySelector(".close-menu-button");
const createDocumentInput = document.querySelector(".create-document-input");
const documentListContainer = document.querySelector(
    ".document-list-container"
);
const readmeTile = document.querySelector(".readme-tile");
const profileButton = document.querySelector(".profile-button");
const profilePopup = document.querySelector(".profile-container");
const readmeTileId = document.querySelector(".sliding-menu-readme-tile-document-id").value;

const md = window.markdownit();
const url = "https://in-browser-markdown-editor-main.onrender.com";

let width = 0;
let markdown = markdownSection.value;
let isPreviewVisible = false;
let profilePopupVisible = false;

// functions
const updateWidth = () => {
    width = window.innerWidth;
};

const updateIsPreviewVisible = () => {
    if (width <= 576) {
        isPreviewVisible = false;
    } else {
        isPreviewVisible = true;
    }
};

const displayEyeConditionally = (isPreviewVisible) => {
    if (isPreviewVisible) {
        hideElement(eyeCrossedIcon);
        showElement(eyeIcon);
    } else {
        showElement(eyeCrossedIcon);
        hideElement(eyeIcon);
    }
};

const displaySectionsConditionally = (width, isPreviewVisible) => {
    if (width <= 576) {
        if (isPreviewVisible) {
            showElement(previewContainer);
            hideElement(markdownContainer);
        } else {
            showElement(markdownContainer);
            hideElement(previewContainer);
        }
    } else {
        showElement(markdownContainer);

        if (isPreviewVisible) {
            showElement(previewContainer);
        } else {
            hideElement(previewContainer);
        }
    }
};

const hideElement = (element) => {
    element.classList.add("hide");
    element.classList.remove("show");
};

const showElement = (element) => {
    element.classList.add("show");
    element.classList.remove("hide");
};

const escapeHTML = (str) => {
    return str.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");  
}

const unescapeHTML = (str) => {
    return str.replace(/&lt;/g , "<") 
        .replace(/&gt;/g , ">")     
        .replace(/&quot;/g , "\"")  
        .replace(/&#39;/g , "\'")  
        .replace(/&amp;/g , "&")
}

const updateMarkdown = () => {
    markdown = markdownSection.value;
};

const renderMarkdown = (markdown) => {
    let result = md.render(markdown);
    previewSection.innerHTML = result;
};

const downloadFile = (fileName, text) => {
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", fileName + ".md");

    hideElement(element);

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

const setAnchorsTargetBlank = (anchors) => {
    anchors.forEach((anchor) => {
        anchor.setAttribute("target", "_blank");
    });
};

const loadAllDocTiles = async () => {
    const data = await getData(`${url}/documents?response_type=json`);
    data.forEach((e) => {
        const documentTile = appendDocumentTile(e.name, e._id);
        addEditAndDeleteFunctionality(documentTile, e._id);
    });
};

const extractMarkdownFromArray = (arr) => {
    let n = arr.length;
    let ans = "";

    for (let i = 0; i < n; i++) {
        let str = arr[i];
        if (i == n - 1) {
            if (str !== "") ans += str;
        } else {
            if (str === "") ans += "\n\n";
            else ans += str;
        }
    }

    return ans;
};

const createDocument = async (name) => {
    documentName.textContent = unescapeHTML(name);
    markdown = "";
    markdownSection.value = markdown;

    renderMarkdown(markdown);

    const response = await postData(`${url}/documents/new`, {
        name,
        markdown: markdown.split("\n"),
    });

    documentId.value = response._id;

    const documentTile = appendDocumentTile(name, response._id);
    addEditAndDeleteFunctionality(documentTile, response._id);
};

const addEditAndDeleteFunctionality = async (documentTile, docId) => {
    const trashButton = documentTile.querySelector(".trash-button");

    trashButton.addEventListener("click", (event) => {
        const deleteMarkdownPopup = appendDeleteMarkdownPopup(documentTile);

        const markdownPopupCancelButton = deleteMarkdownPopup.querySelector(
            ".markdown-popup-cancel-button"
        );

        markdownPopupCancelButton.addEventListener("click", () => {
            editorContainer.classList.remove("overlay");
            document.body.removeChild(deleteMarkdownPopup);
        });

        const markdownPopupDeleteButton = deleteMarkdownPopup.querySelector(
            ".markdown-popup-delete-button"
        );

        markdownPopupDeleteButton.addEventListener("click", async () => {
            const data = await getData(`${url}/documents?response_type=json`);
            let documentToLoad = "EMPTY!";
            let canUpdate = true;
            data.forEach((e) => {
                if (e._id === docId) {
                    canUpdate = false;
                }
                if (canUpdate) {
                    documentToLoad = e._id;
                }
            });

            await deleteData(`${url}/documents/${docId}`);

            if (documentToLoad && documentToLoad !== "EMPTY!" && docId === documentId.value) {
                document
                    .querySelector(`input[value='${documentToLoad}']`)
                    .click();
            }

            if(documentToLoad === "EMPTY!") {
                readmeTile.click();
            }

            editorContainer.classList.remove("overlay");
            document.body.removeChild(deleteMarkdownPopup);
            documentListContainer.removeChild(documentTile);
        });

        event.stopPropagation();
    });

    const renameButton = documentTile.querySelector(".rename-button");
    let renameButtonClicked = false;

    renameButton.addEventListener("click", (event) => {
        if (renameButtonClicked) renameButtonClicked = false;
        else renameButtonClicked = true;

        toggleRenameButton();
        event.stopPropagation();
    });

    const toggleRenameButton = () => {
        if (renameButtonClicked) {
            hideElement(
                documentTile.querySelector(".sliding-menu-tile-document-name")
            );
            showElement(documentTile.querySelector(".edit-name-input"));
            renameButton.src = "/img/cross.svg";
            renameButton.alt = "cross";

            const editNameInput =
                documentTile.querySelector(".edit-name-input");

            editNameInput.addEventListener("click", (event) => {
                event.stopPropagation();
            });

            editNameInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    checkAndUpdateName(editNameInput.value);
                }
                event.stopPropagation();
            });

            const checkAndUpdateName = async (name) => {
                name = name.trim();
                const prevName = documentTile.querySelector(
                    ".sliding-menu-tile-document-name"
                ).textContent;

                if (name.length === 0 || name === prevName) {
                    console.log("Please enter a valid name!");
                } else {
                    await putData(
                        `${url}/documents/${documentId.value}`,
                        {
                            name,
                        }
                    );

                    showElement(
                        documentTile.querySelector(
                            ".sliding-menu-tile-document-name"
                        )
                    );
                    hideElement(documentTile.querySelector(".edit-name-input"));

                    documentTile.querySelector(
                        ".sliding-menu-tile-document-name"
                    ).textContent = name;

                    if (documentName.textContent === prevName) {
                        documentName.textContent = unescapeHTML(name);
                    }

                    renameButton.src = "/img/pencil.svg";
                    renameButton.alt = "pencil";
                    documentTile.querySelector(".edit-name-input").value = "";
                }
            };
        } else {
            showElement(
                documentTile.querySelector(".sliding-menu-tile-document-name")
            );
            hideElement(documentTile.querySelector(".edit-name-input"));
            renameButton.src = "/img/pencil.svg";
            renameButton.alt = "pencil";
            documentTile.querySelector(".edit-name-input").value = "";
        }
    };
};

const appendDocumentTile = (name, docId) => {
    const documentTile = document.createElement("div");

    documentTile.setAttribute(
        "class",
        "document sliding-menu-tile flex flex-ai-c"
    );

    documentTile.innerHTML = `
        <img src="/img/hastag.svg" alt="hastag" />
        <p class="sliding-menu-tile-document-name">${escapeHTML(name)}</p>
        <input class="edit-name-input hide" type="text" placeholder="Enter new name" />
        <img class="rename-button" src="/img/pencil.svg" alt="pencil" />
        <img class="trash-button" src="/img/trash.svg" alt="trash" />
        <input class="sliding-menu-tile-document-id" type="hidden" value=${docId}>
    `;

    documentListContainer.appendChild(documentTile);

    documentTile.addEventListener("click", async () => {
        const data = await getData(
            `${url}/documents/${docId}?response_type=json`
        );

        documentId.value = data._id;
        documentName.textContent = unescapeHTML(data.name);
        markdown = extractMarkdownFromArray(data.markdown);
        markdownSection.value = markdown;
        renderMarkdown(markdown);
        closeMenuButton.click();
    });

    return documentTile;
};

const appendDeleteMarkdownPopup = (documentTile) => {
    const deleteMarkdownPopup = document.createElement("div");

    deleteMarkdownPopup.setAttribute("class", "delete-markdown-popup");

    deleteMarkdownPopup.innerHTML = `
            <div
                class="delete-markdown-popup-text-container flex flex-dir-col"
            >
                <p>"${
                    escapeHTML(
                        documentTile.querySelector(
                            ".sliding-menu-tile-document-name"
                        ).textContent
                    )
                }" will be permanently deleted.</p>
                <p>You won't be able to undo this action.</p>
            </div>
            <div
                class="delete-markdown-popup-buttons-container flex flex-ai-c"
            >
                <a
                    class="markdown-popup-button markdown-popup-cancel-button flex flex-jc-c flex-ai-c"
                    href="#"
                    >Cancel</a
                >
                <a
                    class="markdown-popup-button markdown-popup-delete-button flex flex-jc-c flex-ai-c"
                    href="#"
                    >Delete</a
                >
            </div>
        `;

    closeMenuButton.click();
    editorContainer.classList.add("overlay");
    document.body.appendChild(deleteMarkdownPopup);

    return deleteMarkdownPopup;
};

// event listners
window.addEventListener("resize", () => {
    updateWidth();
    displayEyeConditionally(isPreviewVisible);
    displaySectionsConditionally(width, isPreviewVisible);
});

eyeIcon.addEventListener("click", () => {
    isPreviewVisible = false;
    displayEyeConditionally(isPreviewVisible);
    displaySectionsConditionally(width, isPreviewVisible);
});

eyeCrossedIcon.addEventListener("click", () => {
    isPreviewVisible = true;
    displayEyeConditionally(isPreviewVisible);
    displaySectionsConditionally(width, isPreviewVisible);
});

markdownSection.addEventListener("input", async () => {
    updateMarkdown();
    renderMarkdown(markdown);

    if(documentId.value !== readmeTileId) {
        await putData(`${url}/documents/${documentId.value}`, {
            markdown: markdown.split("\n"),
        });
    } else {
        console.log("You can't modify documents which are not yours!");
    }

    const previewSectionAnchors = previewSection.querySelectorAll("a");
    setAnchorsTargetBlank(previewSectionAnchors);
});

downloadButton.addEventListener("click", () => {
    downloadFile(documentName.textContent, markdown);
});

hamburgerButton.addEventListener("click", () => {
    editorContainer.classList.add("overlay");
    slidingMenu.classList.add("active");
});

closeMenuButton.addEventListener("click", () => {
    editorContainer.classList.remove("overlay");
    slidingMenu.classList.remove("active");
});

profileButton.addEventListener("click", () => {
    if(profilePopupVisible) {
        profilePopup.style.bottom = "-10.625rem";
    } else {
        profilePopup.style.bottom = "3.125rem";
    }
    profilePopupVisible = !profilePopupVisible;
});

createDocumentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const documentName = createDocumentInput.value;
        if (documentName === "") {
            console.log("Please enter a valid document name!");
        } else {
            createDocument(documentName);
            createDocumentInput.value = "";
        }
    }
});

readmeTile.addEventListener("click", async () => {
    const data = await getData(
        `${url}/documents/readme?response_type=json`
    );

    documentId.value = data._id;
    documentName.textContent = unescapeHTML(data.name);
    markdown = extractMarkdownFromArray(data.markdown);
    markdownSection.value = markdown;
    renderMarkdown(markdown);
    closeMenuButton.click();
});

// function calls
updateWidth();
updateIsPreviewVisible();
loadAllDocTiles();
renderMarkdown(markdown);
setAnchorsTargetBlank(previewSection.querySelectorAll("a"));