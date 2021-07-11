import { extendTheme } from '@chakra-ui/react';
import config from './config';
import styles from './styles';
import fonts from './fonts';
import components from './components';

const overrides = {
    config,
    styles,
    fonts,
    components,
};

const theme = extendTheme(overrides);
export default theme;
