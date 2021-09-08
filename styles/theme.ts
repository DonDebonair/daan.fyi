import { extendTheme } from '@chakra-ui/react';
import config from './config';
import styles from './styles';
import fonts from './fonts';
import components from './components';
import fontSizes from './fontSizes';

const overrides = {
    config,
    styles,
    fonts,
    fontSizes,
    components,
};

// @ts-ignore
const theme = extendTheme(overrides);
export default theme;
