const components = {
    Heading: {
        baseStyle: {
            mt: 2,
            mb: 4,
        },
    },
    Text: {
        baseStyle: {
            mb: 2,
            mt: 2,
        },
    },
    List: {
        parts: ['container', 'item', 'icon'],
        baseStyle: {
            container: {
                mb: 2,
                mt: 2,
            },
        },
    },
    Table: {
        parts: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption'],
        baseStyle: {
            table: {
                mb: 6,
            },
        },
    },
};

export default components;
