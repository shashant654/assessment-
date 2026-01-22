// src/components/MetricsCard.js
import React from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const MetricsCard = ({ title, value, icon, change, changeType, color = 'blue' }) => {
  const bg = useColorModeValue('white', 'gray.800');
  
  return (
    <Box
      bg={bg}
      borderRadius="lg"
      boxShadow="sm"
      p={{ base: 3, md: 4 }}
      borderLeft="4px"
      borderColor={`${color}.500`}
      transition="all 0.3s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Flex 
        justify="space-between" 
        align={{ base: 'flex-start', sm: 'center' }} 
        direction={{ base: 'column', sm: 'row' }}
        gap={2}
      >
        <Stat>
          <StatLabel color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
            {title}
          </StatLabel>
          <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
            {value}
          </StatNumber>
          {change && change !== '...' && (
            <StatHelpText>
              <StatArrow type={changeType} />
              {change}
            </StatHelpText>
          )}
          {change === '...' && (
            <StatHelpText>Updating...</StatHelpText>
          )}
        </Stat>
        <Box
          p={{ base: 1, md: 2 }}
          borderRadius="md"
          bg={`${color}.50`}
          color={`${color}.500`}
          flexShrink={0}
        >
          <Icon as={icon} boxSize={{ base: 4, md: 6 }} />
        </Box>
      </Flex>
    </Box>
  );
};

export default MetricsCard;