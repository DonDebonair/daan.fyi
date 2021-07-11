const components = {
    Heading: {
        baseStyle: {
            mt: 2,
            mb: 8,
        },
    },
    Text: {
        baseStyle: {
            mb: 4,
        },
    },
    List: {
        parts: ['container', 'item', 'icon'],
        baseStyle: {
            container: {
                mb: 4,
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
