/**
 * Tệp cấu hình môi trường cho ứng dụng.
 * Trong thực tế, bạn sẽ có environment.ts cho phát triển và environment.prod.ts cho triển khai.
 */
import {env} from "@ngx-env/builder";
console.log(env);
export const environment = {
  production: false,
  youtubeApiUrl: 'https://youtube-uploader-be.onrender.com/',
  geminiApiKey: "AIzaSyBvZLI52YsfO3XqiwJ5euYLjpsYYjvUpLA", // Khóa API để trống để đảm bảo bảo mật khi chia sẻ code
  appId: "youtube-uploader-prod"
};
