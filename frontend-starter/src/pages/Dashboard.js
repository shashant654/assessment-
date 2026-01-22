// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  SimpleGrid,
  Button,
  Badge,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { FiMessageCircle, FiClock, FiThumbsUp, FiAlertCircle, FiRefreshCw, FiMenu, FiFilter } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import ConversationList from '../components/ConversationList';
import MetricsCard from '../components/MetricsCard';
import { subscribeToMetrics } from '../api';

const Dashboard = () => {
  const { conversations, agents, loading, error } = useAppData();
  const [timeRange, setTimeRange] = useState('today');
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Subscribe to real-time metrics with SSE (updates every 2 seconds)
  useEffect(() => {
    setMetricsLoading(true);
    setMetricsError(null);
    setIsConnected(false);

    const unsubscribe = subscribeToMetrics(
      timeRange,
      (data) => {
        setLiveMetrics(data);
        setLastUpdate(new Date());
        setMetricsLoading(false);
        setIsConnected(true);
      },
      (error) => {
        console.error('Metrics subscription error:', error);
        setMetricsError('Failed to connect to real-time metrics. Retrying...');
        setMetricsLoading(false);
        setIsConnected(false);
        // Auto-retry after 5 seconds
        setTimeout(() => {
          setMetricsError(null);
        }, 5000);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [timeRange]);

  // Use live metrics if available, otherwise calculate from conversations
  const activeConversations = liveMetrics?.metrics?.activeConversations || conversations.filter(conv => conv.status === 'active').length;
  const escalatedConversations = liveMetrics?.metrics?.escalatedConversations || conversations.filter(conv => conv.status === 'escalated').length;
  const highAlertConversations = liveMetrics?.metrics?.highAlertConversations || conversations.filter(conv => conv.alertLevel === 'high').length;

  const avgResponseTime = liveMetrics?.metrics?.avgResponseTime || (
    conversations.length > 0
      ? Math.round((conversations.reduce((sum, conv) => sum + (conv.metrics?.responseTime || 0), 0) / conversations.length) * 10) / 10
      : 0
  );

  const avgSentiment = liveMetrics?.metrics?.avgSentiment || (
    conversations.length > 0
      ? conversations.reduce((sum, conv) => sum + (conv.metrics?.sentiment || 0), 0) / conversations.length
      : 0
  );

  const sentimentPercentage = `${Math.round(avgSentiment * 100)}%`;

  return (
    <Box px={{ base: 2, md: 0 }}>
      {/* Mobile Header with Filter Drawer */}
      <Flex 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }} 
        mb={{ base: 4, md: 6 }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 4 }}
        flexWrap="wrap"
      >
        <Box flex="1" minW="0">
          <Flex align="center" gap={2}>
            <Heading size={{ base: 'md', md: 'lg' }} noOfLines={1}>Agent Supervisor Dashboard</Heading>
            {isMobile && (
              <IconButton
                icon={<FiFilter />}
                aria-label="Filter options"
                variant="ghost"
                size="sm"
                onClick={onOpen}
                ml="auto"
              />
            )}
          </Flex>
          <Text color="gray.500" fontSize={{ base: 'xs', md: 'md' }} noOfLines={2}>
            Monitor and manage AI agent interactions
          </Text>
          {isConnected && (
            <HStack spacing={2} mt={1}>
              <Box w={2} h={2} borderRadius="full" bg="green.400" animation="pulse 2s infinite" />
              <Text color="green.500" fontSize="xs">
                Live metrics • Updates every 2s
                {lastUpdate && ` • Last: ${lastUpdate.toLocaleTimeString()}`}
              </Text>
            </HStack>
          )}
        </Box>

        {/* Desktop Time Range Buttons */}
        <HStack 
          spacing={2} 
          display={{ base: 'none', md: 'flex' }}
          flexShrink={0}
        >
          {['today', 'week', 'month'].map((range) => (
            <Button
              key={range}
              size="md"
              variant={timeRange === range ? 'solid' : 'outline'}
              colorScheme={timeRange === range ? 'brand' : 'gray'}
              onClick={() => setTimeRange(range)}
              textTransform="capitalize"
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </Button>
          ))}
        </HStack>

        {/* Mobile Time Range Buttons */}
        <HStack 
          spacing={2} 
          display={{ base: 'flex', md: 'none' }}
          width="full"
          overflowX="auto"
          pb={1}
          css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}
        >
          {['today', 'week', 'month'].map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? 'solid' : 'outline'}
              colorScheme={timeRange === range ? 'brand' : 'gray'}
              onClick={() => setTimeRange(range)}
              flexShrink={0}
              minW="fit-content"
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'Week' : 'Month'}
            </Button>
          ))}
        </HStack>
      </Flex>

      {/* Mobile Filter Drawer */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader>Filter Options</DrawerHeader>
          <DrawerBody pb={6}>
            <VStack spacing={3}>
              <Text fontWeight="medium" alignSelf="flex-start">Time Range</Text>
              {['today', 'week', 'month'].map((range) => (
                <Button
                  key={range}
                  width="full"
                  variant={timeRange === range ? 'solid' : 'outline'}
                  colorScheme={timeRange === range ? 'brand' : 'gray'}
                  onClick={() => {
                    setTimeRange(range);
                    onClose();
                  }}
                  textTransform="capitalize"
                >
                  {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {metricsError && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          {metricsError}
        </Alert>
      )}

      {metricsLoading && liveMetrics === null && (
        <Flex justify="center" align="center" py={8}>
          <Spinner mr={3} />
          <Text>Connecting to live metrics...</Text>
        </Flex>
      )}

      <SimpleGrid 
        columns={{ base: 1, sm: 2, lg: 4 }} 
        spacing={{ base: 3, md: 4 }} 
        mb={6}
      >
        <MetricsCard
          title="Active Conversations"
          value={activeConversations}
          icon={FiMessageCircle}
          change={metricsLoading && liveMetrics ? '...' : '23%'}
          changeType="increase"
          color="blue"
        />
        <MetricsCard
          title="Escalations"
          value={escalatedConversations}
          icon={FiAlertCircle}
          change={metricsLoading && liveMetrics ? '...' : '5%'}
          changeType="decrease"
          color="orange"
        />
        <MetricsCard
          title="Avg Response Time"
          value={`${avgResponseTime}s`}
          icon={FiClock}
          change={metricsLoading && liveMetrics ? '...' : '30%'}
          changeType="decrease"
          color="green"
        />
        <MetricsCard
          title="Customer Satisfaction"
          value={sentimentPercentage}
          icon={FiThumbsUp}
          change={metricsLoading && liveMetrics ? '...' : '7%'}
          changeType="increase"
          color="purple"
        />
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="brand" isLazy>
        <TabList overflowX={{ base: 'auto', md: 'unset' }} pb={{ base: 2, md: 0 }}>
          <Tab fontSize={{ base: 'sm', md: 'md' }}>All Conversations</Tab>
          <Tab fontSize={{ base: 'sm', md: 'md' }}>
            Needs Attention{' '}
            {highAlertConversations > 0 && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {highAlertConversations}
              </Badge>
            )}
          </Tab>
          <Tab fontSize={{ base: 'sm', md: 'md' }}>Agent Performance</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={{ base: 2, md: 0 }}>
            <ConversationList 
              conversations={conversations}
              loading={loading.conversations}
              error={error.conversations}
            />
          </TabPanel>

          <TabPanel px={{ base: 2, md: 0 }}>
            <ConversationList 
              conversations={conversations.filter(conv => conv.alertLevel === 'high')}
              loading={loading.conversations}
              error={error.conversations}
            />
          </TabPanel>

          <TabPanel px={{ base: 2, md: 0 }}>
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: 2 }} 
              spacing={{ base: 3, md: 6 }}
            >
              {agents.map(agent => (
                <Box
                  key={agent.id}
                  bg={cardBg}
                  p={{ base: 3, md: 4 }}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Flex justify="space-between" align="center" mb={4} direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Flex align="center">
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={agent.status === 'active' ? 'green.400' : 'gray.400'}
                        mr={3}
                      />
                      <Heading size={{ base: 'sm', md: 'md' }}>{agent.name}</Heading>
                    </Flex>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                      {agent.model}
                    </Text>
                  </Flex>

                  <SimpleGrid columns={{ base: 2, sm: 2 }} spacing={{ base: 2, md: 4 }}>
                    <Box>
                      <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                        Conversations
                      </Text>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                        {agent.metrics?.conversations || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                        Avg Response Time
                      </Text>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                        {agent.metrics?.avgResponseTime || 0}s
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                        Satisfaction
                      </Text>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                        {agent.metrics?.satisfaction ? `${Math.round(agent.metrics.satisfaction * 100)}%` : 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                        Escalation Rate
                      </Text>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                        {agent.metrics?.escalationRate ? `${Math.round(agent.metrics.escalationRate * 100)}%` : 'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Dashboard;