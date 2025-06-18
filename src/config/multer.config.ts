import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/images',

    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      cb(
        new BadRequestException(
          'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.',
        ),
        false,
      );
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
};
