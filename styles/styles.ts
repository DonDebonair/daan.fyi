import { mode, Styles } from '@chakra-ui/theme-tools';

const styles: Styles = {
    global: (props) => ({
        html: {
            scrollBehavior: 'smooth',
            fontSize: '18px',
        },
        body: {
            bg: mode('white', 'gray.900')(props),
        },
        // Charka draws a box shadow to visualize elements with focus
        // This CSS removes that box shadow unless we're interacting through keyboard
        ':focus:not(:focus-visible):not([role="dialog"]):not([role="menu"])': {
            boxShadow: 'none !important',
        },
        code: {
            whiteSpace: 'pre',
            fontSize: 'sm',
        },
        pre: {
            marginBottom: '4',
        },
        "pre:not([class*='language-'])": {
            overflowX: 'auto',
            width: '100%',
            paddingLeft: 4,
        },
        // START OF SYNTAX HIGHLIGHTING STYLES
        "code[class*='language-'], pre[class*='language-']": {
            color: mode('gray.800', 'gray.50')(props),
            marginTop: 0,
            background: 'none',
            fontFamily: 'mono',
            fontSize: 'sm',
            textAlign: 'left',
            wordSpacing: 'normal',
            wordBreak: 'normal',
            wordWrap: 'normal',
            lineHeight: 'base',
            MozTabSize: 4,
            OTabSize: 4,
            tabSize: 4,
            WebkitHyphens: 'none',
            MozHyphens: 'none',
            msHyphens: 'none',
            hyphens: 'none',
            width: '100%',
        },
        "pre[class*='language-']": {
            paddingTop: 4,
            paddingBottom: 4,
            paddingInlineStart: 4,
            paddingInlineEnd: 4,
            margin: '0 0 4 0',
            overflowX: 'auto',
            // minWidth: '100%',
            fontSize: '0.9rem',
            // whiteSpace: 'nowrap',
        },
        ":not(pre) > code[class*='language-'], pre[class*='language-']": {
            background: mode('gray.50', 'gray.800')(props),
            border: '1px',
            borderRadius: 'lg',
            borderStyle: 'solid',
            borderColor: mode('gray.200', 'gray.600')(props),
        },
        ":not(pre) > code[class*='language-']": {
            padding: '0.1em',
            borderRadius: '0.3em',
            whiteSpace: 'normal',
        },
        // Tokens
        '.token.prolog, .token.cdata': {
            color: 'slategray',
        },
        '.token-comment': {
            color: mode('slategray', 'rgb(128, 147, 147)')(props),
        },
        '.token.symbol, .token.deleted': {
            color: '#905',
        },
        '.token.inserted': {
            color: '#690',
        },
        '.token.entity, .language-css .token.string, .style .token.string': {
            color: '#9a6e3a',
        },
        '.token.atrule, .token.attr-value': { color: '#07a' },
        '.token.regex, .token.important': { color: '#e90' },
        '.token.char, .token.builtin': {
            color: mode('#690', 'rgb(130, 170, 255)')(props),
        },
        '.token.attr-name, .token.string': {
            color: mode('#690', 'cyan.600')(props),
        },
        '.token.constant': {
            color: mode('#905', 'rgb(130, 170, 255)')(props),
        },
        '.token.url': {
            color: mode('#9a6e3a', 'rgb(173, 219, 103)')(props),
        },
        '.token.variable': {
            color: mode('#e90', 'rgb(214, 222, 235)')(props),
        },
        '.token.number': {
            color: mode('#905', 'rgb(247, 140, 108)')(props),
        },
        '.token.tag': {
            color: mode('#905', '#ffa7c4')(props),
        },
        '.token.operator': {
            color: mode('#9a6e3a', '#ffa7c4')(props),
        },
        '.token.keyword': {
            color: mode('#07a', '#ffa7c4')(props),
        },
        '.token.function': {
            color: mode('#dd4a68', 'rgb(130, 170, 255)')(props),
        },
        '.token.punctuation': {
            color: mode('#999', 'rgb(199, 146, 234)')(props),
        },
        '.token.selector': {
            color: mode('#690', 'rgb(199, 146, 234)')(props),
        },
        '.token.doctype': {
            color: mode('slategray', 'rgb(199, 146, 234)')(props),
        },
        '.token.class-name': {
            color: mode('#dd4a68', 'rgb(255, 203, 139)')(props),
        },
        '.token.boolean': {
            color: mode('#905', 'rgb(255, 88, 116)')(props),
        },
        '.token.property': {
            color: mode('#905', 'rgb(128, 203, 196)')(props),
        },
        '.token.namespace': {
            color: mode('slategray', 'rgb(178, 204, 214)')(props),
            opacity: 0.7,
        },
        '.token.important, .token.bold': { fontWeight: 'bold' },
        '.token.italic': { fontStyle: 'italic' },
        '.token.entity': { cursor: 'help' },
        '.token.attr-name, .token.doctype': {
            fontStyle: 'italic',
        },
        '.mdx-marker': {
            display: 'block',
            marginLeft: -4,
            marginRight: -4,
            paddingLeft: 4,
            paddingRight: 4,
            backgroundColor: mode('hsla(204, 45%, 96%, 1)', 'gray.700')(props),
            boxShadow: 'inset 4px 0px 0 0px var(--chakra-colors-blue-600)',
            minWidth: 'fit-content',
        },
        '.remark-code-title': {
            paddingX: 4,
            paddingY: 4,
            fontFamily: 'mono',
            background: mode('gray.200', 'gray.700')(props),
            color: mode('gray.800', 'gray.100')(props),
            borderWidth: '1px 1px 0',
            borderStyle: 'solid',
            borderColor: mode('gray.200', 'gray.600')(props),
            borderTopLeftRadius: 'lg',
            borderTopRightRadius: 'lg',
            fontWeight: 600,
            marginBottom: 0,
            width: '100%',
            '+ pre': {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                marginTop: '0 !important',
            },
        },
    }),
};

export default styles;
