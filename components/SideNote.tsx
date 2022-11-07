import { Box, Heading, HStack, useColorModeValue, Icon } from '@chakra-ui/react';
import React, { ReactElement, ReactNode } from 'react';
import { ThemeTypings } from '@chakra-ui/styled-system/dist/theming.types';
import {
    MdLocalFireDepartment,
    MdInfoOutline,
    MdOutlineCheckCircleOutline,
    MdWarningAmber,
} from 'react-icons/md';
import { IconType } from 'react-icons';

type ThemeColor = ThemeTypings['colors'];

type BaseSideNoteProps = {
    title: string;
    bg: ThemeColor;
    borderColor: ThemeColor;
    icon: ReactNode;
    children: ReactNode;
};

const BaseSideNote = ({
    title,
    bg,
    borderColor,
    children,
    icon,
}: BaseSideNoteProps): ReactElement => {
    return (
        <Box
            as="aside"
            bg={bg}
            w="100%"
            p={4}
            mt={4}
            mb={4}
            borderRadius="md"
            borderLeftWidth={6}
            borderLeftColor={borderColor}
            borderLeftStyle="solid"
        >
            <HStack>
                {icon}
                <Heading mt={0} fontSize="md">
                    {title}
                </Heading>
            </HStack>

            {children}
        </Box>
    );
};

type SideNoteType = 'info' | 'success' | 'warning' | 'danger';

type SideNoteVariant = {
    Icon: IconType;
    dark: Pick<BaseSideNoteProps, 'bg' | 'borderColor'>;
    light: Pick<BaseSideNoteProps, 'bg' | 'borderColor'>;
};

const sideNoteVariants: { [V in SideNoteType]: SideNoteVariant } = {
    success: {
        Icon: MdOutlineCheckCircleOutline,
        dark: {
            bg: 'green.700',
            borderColor: 'green.333',
        },
        light: {
            bg: 'green.200',
            borderColor: 'green.700',
        },
    },
    warning: {
        Icon: MdWarningAmber,
        dark: {
            bg: 'yellow.700',
            borderColor: 'yellow.300',
        },
        light: {
            bg: 'yellow.200',
            borderColor: 'yellow.700',
        },
    },
    info: {
        Icon: MdInfoOutline,
        dark: {
            bg: 'blue.600',
            borderColor: 'blue.100',
        },
        light: {
            bg: 'blue.100',
            borderColor: 'blue.600',
        },
    },
    danger: {
        Icon: MdLocalFireDepartment,
        dark: {
            bg: 'red.700',
            borderColor: 'red.200',
        },
        light: {
            bg: 'red.200',
            borderColor: 'red.700',
        },
    },
};

type SideNoteProps = {
    title: string;
    type: SideNoteType;
    children: ReactNode;
};

const SideNote = ({ title, type, children }: SideNoteProps): ReactElement => {
    const variant = sideNoteVariants[type];
    const bg = useColorModeValue(variant.light.bg, variant.dark.bg);
    const borderColor = useColorModeValue(variant.light.borderColor, variant.dark.borderColor);
    return (
        <BaseSideNote
            title={title}
            bg={bg}
            borderColor={borderColor}
            icon={<Icon as={variant.Icon} color={borderColor} />}
        >
            {children}
        </BaseSideNote>
    );
};

export default SideNote;
