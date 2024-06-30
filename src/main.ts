import "./style.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

initializeApp(firebaseConfig);
const storage = getStorage();

const fileInput: HTMLInputElement = document.getElementById(
  "formFile"
) as HTMLInputElement;
const uploadButton: HTMLButtonElement = document.getElementById(
  "uploadButton"
) as HTMLButtonElement;

function getSelectedFile(): File | undefined {
  return fileInput.files?.[0];
}

function showLoader() {
  uploadButton.disabled = true;
  uploadButton.innerHTML =
    'Uploading <i class="fa-solid fa-spinner fa-spin fa-pulse"></i>';
}

function hideLoader() {
  uploadButton.disabled = false;
  uploadButton.innerHTML = "Upload";
}

function displayUploadStatus(message: string, url: string) {
  const uploadStatus: HTMLElement | null =
    document.getElementById("uploadStatus");
  if (uploadStatus) {
    uploadStatus.innerHTML = `
      <div
        class="alert alert-success d-flex justify-content-between align-items-center"
        role="alert"
      >
        <div>
          <i class="fas fa-check-circle"></i>
          ${message}
          <a
            href="${url}"
            class="btn btn-success text-decoration-none"
            target="_blank"
          >
            File Link
            <i class="fa-solid fa-link"></i>
          </a>
        </div>

        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>`;
  }
}

function uploadFile(file: File) {
  const fileInputRef = ref(storage, `images/${file.name}`);
  const uploadTask = uploadBytesResumable(fileInputRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    },
    (error) => {
      console.error(error);
      fileInput.value = "";
      hideLoader();
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        displayUploadStatus("File uploaded successfully!", downloadURL);
        fileInput.value = "";
        hideLoader();
      });
    }
  );
}

function handleFileUpload() {
  const file = getSelectedFile();

  if (file) {
    showLoader();
    uploadFile(file);
    console.log("File selected:", file);
  } else {
    alert("No file selected.");
  }
}

(window as any).handleFileUpload = handleFileUpload;
