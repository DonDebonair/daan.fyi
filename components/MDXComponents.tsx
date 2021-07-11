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

export const MDXComponents = {
    h1: (props: HeadingProps): ReactNode => <Heading as="h1" size="2xl" {...props} />,
    h2: (props: HeadingProps): ReactNode => <Heading as="h2" size="xl" {...props} />,
    h3: (props: HeadingProps): ReactNode => <Heading as="h3" size="lg" {...props} />,
    h4: (props: HeadingProps): ReactNode => <Heading as="h4" size="md" {...props} />,
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
