import { ref } from 'vue'
import { message } from 'ant-design-vue'

export const useImageUpload = () => {
  const imageFileList = ref([])
  const uploadedImageUrl = ref('')

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过2MB')
      return false
    }
    return true
  }

  const customImageUpload = ({ file, onSuccess }) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImageUrl.value = e.target.result
      onSuccess('success', file)
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (info) => {
    imageFileList.value = info.fileList
  }

  const setImage = (url) => {
    uploadedImageUrl.value = url || ''
    imageFileList.value = uploadedImageUrl.value 
      ? [{ uid: '-1', name: 'current', status: 'done', url: uploadedImageUrl.value }] 
      : []
  }

  const resetImage = () => {
    imageFileList.value = []
    uploadedImageUrl.value = ''
  }

  const getImages = () => {
    const defaultImage = '/photo/OIP-C.jpg'
    return uploadedImageUrl.value ? [uploadedImageUrl.value] : [defaultImage]
  }

  return {
    imageFileList,
    uploadedImageUrl,
    beforeImageUpload,
    customImageUpload,
    handleImageChange,
    setImage,
    resetImage,
    getImages
  }
}