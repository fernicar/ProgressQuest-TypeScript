
export const AssetMap = {
  swords: 'images/swords.gif',
  logo: 'images/pq.gif',
  close: 'images/closeup.png',
  closedown: 'images/closedown.png',
  dice: 'images/dicebar.jpg',
  background: 'images/back.jpg',
};

export const Assets: Record<keyof typeof AssetMap, string> = {
  swords: '',
  logo: '',
  close: '',
  closedown: '',
  dice: '',
  background: '',
};

async function getImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText} from ${imageUrl}`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          // We keep the full Data URI (including "data:image/...") so it works directly in <img src> and css url()
          resolve(reader.result as string);
        } else {
          reject(new Error("FileReader did not successfully read the file."));
        }
      };
      reader.onerror = (error) => {
        console.error(`FileReader error for ${imageUrl}:`, error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error fetching or converting image ${imageUrl}:`, error);
    return null;
  }
}

export async function loadAssets() {
  const promises = Object.keys(AssetMap).map(async (key) => {
    const k = key as keyof typeof AssetMap;
    const b64 = await getImageAsBase64(AssetMap[k]);
    if (b64) {
      Assets[k] = b64;
    }
  });
  await Promise.all(promises);
}
