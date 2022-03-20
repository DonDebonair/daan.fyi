import React, { ReactElement, ReactNode } from 'react';
import { Box, Tooltip } from '@chakra-ui/react';

type AsteriskProps = {
    content: ReactNode;
};

const Asterisk = ({ content }: AsteriskProps): ReactElement => {
    return (
        <Tooltip label={content} openDelay={150} hasArrow arrowSize={15}>
            <Box as="span" ml={0.5} color="red.500" fontSize="lg" cursor="pointer">
                <strong>*</strong>
            </Box>
        </Tooltip>
    );
};

export default Asterisk;
