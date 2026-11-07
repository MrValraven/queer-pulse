/** jsdom 25 ships Blob and File without `arrayBuffer()`, which every browser
 *  the upload flow supports has. Importing this module gives the test's Blob
 *  prototype that method, read through jsdom's own FileReader, so a spec can
 *  hand a real File to code that reads its bytes. Leaves a native method
 *  alone. */
if (typeof Blob.prototype.arrayBuffer !== "function") {
  Blob.prototype.arrayBuffer = function readBlobBytes(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () =>
        reject(reader.error ?? new Error("FileReader could not read the blob"));
      reader.readAsArrayBuffer(this);
    });
  };
}

export {};
