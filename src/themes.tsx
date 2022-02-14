import { createTheme } from '@mui/material';


const lightTheme = createTheme({
    typography: {
        h1: {
            fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        },
        h2: {
            fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        },
        h3: {
            fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        },
        h6: {
            fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
        },
        body1: {
            fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
        }
    }
});

export { lightTheme };