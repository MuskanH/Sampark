import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const upload = async(file)=>{
  //   const date = new Date();
  //   // const storageRef = ref(storage, `images/${date + file.name}`);   
  //   // const uploadTask = uploadBytesResumable(storageRef, file);
  ////////////////////////////////////////////////////////
  //   const fileExtension = file.name.split('.').pop(); // Get the file extension (e.g., 'jpg', 'mp3', 'webm')

  // // Determine the folder (images or audio) based on the file type
  // const folder = (file.type.startsWith('image/')) ? 'images' : 'audio';
  // const storageRef = ref(storage, `${folder}/${date.getTime()}-${file.name}`);

  // const uploadTask = uploadBytesResumable(storageRef, file);

  const date = new Date();
  const fileType = file.type.split("/")[0]; // "image", "audio", etc.
  
  // Set folder based on file type (e.g., "images" for image files, "audio" for audio files)
  const folder = fileType === "image" ? "images" : fileType === "audio" ? "audio" : "others";
  
  const storageRef = ref(storage, `${folder}/${date + file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise ((resolve,reject)=>{
        uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
              }
            }, 
            (error) => {
                reject("Something went wrong!" + error.code)
            }, 
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
    });

};

export default upload