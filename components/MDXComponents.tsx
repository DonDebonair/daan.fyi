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
    chakra,
} from '@chakra-ui/react';
import { HTMLChakraProps } from '@chakra-ui/system';
import { StylishLink } from '@/components/CustomLink';
import React from 'react';
import { TableCellProps, TableColumnHeaderProps } from '@chakra-ui/table';
import Image from 'next/image';
import { Small } from '@/components/typography';
import SideNote from '@/components/SideNote';
import Asterisk from '@/components/Asterisk';

const Hr = () => {
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    return <Divider borderColor={borderColor} my={4} w="100%" />;
};

const InlineCode = (props) => {
    const colorScheme = useColorModeValue('gray', 'pink');
    return <Code colorScheme={colorScheme} {...props} />;
};

const Blockquote = (props: HTMLChakraProps<'blockquote'>) => (
    <chakra.blockquote
        p={6}
        mx={2}
        position="relative"
        _before={{
            content: "'“'",
            position: 'absolute',
            left: 1,
            top: 3,
            fontSize: '4xl',
        }}
        _after={{
            content: "'”'",
            position: 'absolute',
            right: 1,
            bottom: 3,
            fontSize: '4xl',
        }}
        {...props}
    />
);

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
    h1: (props: HeadingProps) => <H as="h1" size="xl" {...props} />,
    h2: (props: HeadingProps) => <H as="h2" size="lg" {...props} />,
    h3: (props: HeadingProps) => <H as="h3" size="md" {...props} />,
    h4: (props: HeadingProps) => <H as="h4" size="sm" {...props} />,
    p: (props) => <Text as="p" {...props} />,
    a: (props) => <StylishLink {...props} />,
    ul: (props) => <UnorderedList pl={4} {...props} />,
    ol: (props) => <OrderedList pl={4} {...props} />,
    li: (props) => <ListItem {...props} />,
    table: (props) => <Table {...props} />,
    thead: (props) => <Thead {...props} />,
    tbody: (props) => <Tbody {...props} />,
    tfoot: (props) => <Tfoot {...props} />,
    tr: (props) => <Tr {...props} />,
    th: (props: TableColumnHeaderProps) => {
        return <Th isNumeric={props.align && props.align == 'right'} {...props} />;
    },
    td: (props: TableCellProps) => {
        return <Td isNumeric={props.align && props.align == 'right'} {...props} />;
    },
    caption: (props) => <TableCaption {...props} />,
    hr: Hr,
    code: (props) => <InlineCode {...props} />,
    blockquote: Blockquote,
    img: (props) => <Image src={props.src} alt={props.alt} {...props} />,
    Small,
    SideNote,
    Asterisk,
};
