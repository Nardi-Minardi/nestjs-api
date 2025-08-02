import { BadRequestException } from '@nestjs/common';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

export const multerOptions = {
  // TODO: turn this on if want to upload locally
  // storage: diskStorage({
  //   destination: './uploads/images',

  //   filename: (req, file, callback) => {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //     const ext = extname(file.originalname);
  //     const filename = `${uniqueSuffix}${ext}`;
  //     callback(null, filename);
  //   },
  // }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Only PDF or image file are allowed'),
        false,
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
