import {
    Code,
    Divider,
    Heading,
    HeadingProps,
    ListItem,
    OrderedList,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useColorModeValue,
} from '@chakra-ui/react';
import CustomLink from '@/components/CustomLink';
import React, { ReactNode } from 'react';
import { TableCellProps, TableColumnHeaderProps } from '@chakra-ui/table/dist/types/table';

const Hr: ReactNode = () => {
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    return <Divider borderColor={borderColor} my={4} w="100%" />;
};

const InlineCode = (props) => {
    const colorScheme = useColorModeValue('gray', 'pink');
    return <Code colorScheme={colorScheme} fontSize="md" {...props} />;
};

const H = (props: HeadingProps) => (
    <Heading
        sx={{
            '&': {
                scrollMarginTop: '5.5rem',
            },
            '&:hover > a': {
                visibility: 'visible',
            },
            '& a': {
                position: 'absolute',
                marginLeft: '-1em',
                paddingRight: '0.5em',
                cursor: 'pointer',
                visibility: 'hidden',
                width: '80%',
                maxWidth: '800px',
                color: 'gray.700',
            },
            '& a:hover': {
                visibility: 'visible',
                textDecoration: 'none',
            },
            '& a span:after': {
                content: '"#"',
            },
        }}
        {...props}
    />
);

export const MDXComponents = {
    h1: (props: HeadingProps): ReactNode => <H as="h1" size="2xl" {...props} />,
    h2: (props: HeadingProps): ReactNode => <H as="h2" size="xl" {...props} />,
    h3: (props: HeadingProps): ReactNode => <H as="h3" size="lg" {...props} />,
    h4: (props: HeadingProps): ReactNode => <H as="h4" size="md" {...props} />,
    p: (props): ReactNode => <Text as="p" {...props} />,
    a: (props): ReactNode => <CustomLink {...props} />,
    ul: (props): ReactNode => <UnorderedList pl={4} {...props} />,
    ol: (props): ReactNode => <OrderedList pl={4} {...props} />,
    li: (props): ReactNode => <ListItem {...props} />,
    table: (props): ReactNode => <Table {...props} />,
    thead: (props): ReactNode => <Thead {...props} />,
    tbody: (props): ReactNode => <Tbody {...props} />,
    tfoot: (props): ReactNode => <Tfoot {...props} />,
    tr: (props): ReactNode => <Tr {...props} />,
    th: (props: TableColumnHeaderProps): ReactNode => {
        return <Th isNumeric={props.align && props.align == 'right'} {...props} />;
    },
    td: (props: TableCellProps): ReactNode => {
        return <Td isNumeric={props.align && props.align == 'right'} {...props} />;
    },
    caption: (props): ReactNode => <TableCaption {...props} />,
    hr: Hr,
    inlineCode: (props): ReactNode => <InlineCode {...props} />,
};