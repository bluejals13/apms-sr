// frontend/eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        // 브라우저 환경 변수 등 필요시 추가
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      // 필요한 커스텀 규칙 작성
    },
  },
];