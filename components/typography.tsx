import { Text, TextProps } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

export const Small = ({ children, ...props }: TextProps): ReactElement => (
    <Text as="p" fontSize="xs" {...props}>
        {children}
    </Text>
);
