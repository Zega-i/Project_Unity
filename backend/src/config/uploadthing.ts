export const uploadthingConfig = {
  token: process.env.UPLOADTHING_TOKEN,
  appId: process.env.UPLOADTHING_APP_ID,
};

export const fileTypeAllowed = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "png", "mp4"];

export const maxFileSize = 10 * 1024 * 1024; // 10MB
