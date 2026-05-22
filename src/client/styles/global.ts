import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font.body};
    background: radial-gradient(1200px 800px at 10% -10%, #1c2633 0%, #0b0f14 60%),
      radial-gradient(900px 600px at 90% 10%, #2a1c14 0%, #0b0f14 60%);
    color: ${({ theme }) => theme.color.text};
    min-height: 100vh;
    overflow: hidden;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  textarea {
    font-family: inherit;
  }
`;
