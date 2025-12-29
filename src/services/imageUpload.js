const UPLOAD_SERVICE = import.meta.env.VITE_UPLOAD_SERVICE || 'cloudinary'

const uploadToCloudinary = async (file, folder = 'posts', isFile = false) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const endpoint = isFile 
    ? `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
    : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Lỗi khi upload ${isFile ? 'file' : 'ảnh'} lên Cloudinary`)
    }

    const data = await response.json()
    return data.secure_url || data.url
  } catch (error) {
    if (error.message) {
      throw error
    }
    throw new Error(`Lỗi khi upload ${isFile ? 'file' : 'ảnh'}. Vui lòng kiểm tra kết nối mạng và cấu hình Cloudinary.`)
  }
}

export const uploadImage = async (file, path) => {
  const folder = path.split('/')[0] || 'posts'
  return await uploadToCloudinary(file, folder, false)
}

export const uploadFile = async (file, path) => {
  const folder = path.split('/')[0] || 'files'
  return await uploadToCloudinary(file, folder, true)
}
