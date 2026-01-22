// src/pages/AgentConfig.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Switch,
  SimpleGrid,
  Badge,
  useToast,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import { updateAgentConfig } from '../api';

const AgentConfig = () => {
  const { agents, loading } = useAppData();
  const toast = useToast();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (agents && agents.length > 0) {
      setSelectedAgent(agents[0].id);
      setConfig(agents[0]);
    }
  }, [agents]);

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    const agent = agents.find(a => a.id === agentId);
    setConfig(agent);
  };

  const handleParameterChange = (param, value) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [param]: value
      }
    }));
  };

  const handleThresholdChange = (threshold, value) => {
    setConfig(prev => ({
      ...prev,
      escalationThresholds: {
        ...prev.escalationThresholds,
        [threshold]: value
      }
    }));
  };

  const handleCapabilityToggle = (capabilityId) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.map(cap =>
        cap.id === capabilityId ? { ...cap, enabled: !cap.enabled } : cap
      )
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateAgentConfig(selectedAgent, {
        parameters: config.parameters,
        escalationThresholds: config.escalationThresholds,
        capabilities: config.capabilities
      });
      toast({
        title: 'Configuration saved',
        description: `${config.name} configuration has been updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving configuration',
        description: error.message || 'Failed to save agent configuration',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading.agents) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={6}>
        <Heading size={{ base: 'md', md: 'lg' }}>AI Agent Configuration</Heading>
        <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
          Configure AI agent parameters, capabilities, and escalation thresholds
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Agent Selection */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Select Agent</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack spacing={4} align="stretch">
              {agents.map(agent => (
                <Button
                  key={agent.id}
                  variant={selectedAgent === agent.id ? 'solid' : 'outline'}
                  onClick={() => handleAgentChange(agent.id)}
                  justifyContent="flex-start"
                  flexDir="column"
                  align="flex-start"
                  h="auto"
                  py={3}
                >
                  <Text fontWeight="bold">{agent.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Model: {agent.model}
                  </Text>
                  <Badge mt={2} colorScheme={agent.status === 'active' ? 'green' : 'gray'}>
                    {agent.status}
                  </Badge>
                </Button>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Configuration Parameters */}
        {config && (
          <Card bg={bgColor} gridColumn={{ base: 'auto', lg: '2 / 4' }}>
            <CardHeader>
              <Heading size="md">Parameters</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Temperature */}
                <FormControl>
                  <FormLabel>Temperature: {config.parameters?.temperature?.toFixed(2) || 0.7}</FormLabel>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.parameters?.temperature || 0.7}
                    onChange={(value) => handleParameterChange('temperature', value)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Lower = more deterministic, Higher = more creative
                  </Text>
                </FormControl>

                {/* Max Tokens */}
                <FormControl>
                  <FormLabel>Max Tokens</FormLabel>
                  <Input
                    type="number"
                    value={config.parameters?.max_tokens || 150}
                    onChange={(e) => handleParameterChange('max_tokens', parseInt(e.target.value))}
                    min={50}
                    max={2000}
                  />
                </FormControl>

                {/* Top P */}
                <FormControl>
                  <FormLabel>Top P: {config.parameters?.top_p?.toFixed(2) || 1}</FormLabel>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.parameters?.top_p || 1}
                    onChange={(value) => handleParameterChange('top_p', value)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Controls diversity via nucleus sampling
                  </Text>
                </FormControl>
              </VStack>
            </CardBody>
            <Divider />
            <CardFooter gap={2}>
              <Button
                colorScheme="blue"
                leftIcon={<FiSave />}
                onClick={handleSaveConfig}
                isLoading={saving}
                flex={1}
              >
                Save Parameters
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiRefreshCw />}
                onClick={() => setConfig(agents.find(a => a.id === selectedAgent))}
              >
                Reset
              </Button>
            </CardFooter>
          </Card>
        )}
      </SimpleGrid>

      {/* Escalation Thresholds */}
      {config && (
        <Card bg={bgColor} mt={6}>
          <CardHeader>
            <Heading size="md">Escalation Thresholds</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* Low Confidence Threshold */}
              <FormControl>
                <FormLabel>Low Confidence Threshold</FormLabel>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.escalationThresholds?.lowConfidence || 0.4}
                  onChange={(value) => handleThresholdChange('lowConfidence', value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="sm" fontWeight="bold" mt={2}>
                  {(config.escalationThresholds?.lowConfidence || 0.4).toFixed(2)}
                </Text>
              </FormControl>

              {/* Negative Sentiment Threshold */}
              <FormControl>
                <FormLabel>Negative Sentiment Threshold</FormLabel>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.escalationThresholds?.negativeSentiment || 0.3}
                  onChange={(value) => handleThresholdChange('negativeSentiment', value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="sm" fontWeight="bold" mt={2}>
                  {(config.escalationThresholds?.negativeSentiment || 0.3).toFixed(2)}
                </Text>
              </FormControl>

              {/* Response Time Threshold */}
              <FormControl>
                <FormLabel>Response Time Threshold (seconds)</FormLabel>
                <Slider
                  min={5}
                  max={60}
                  step={1}
                  value={config.escalationThresholds?.responseTime || 20}
                  onChange={(value) => handleThresholdChange('responseTime', value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="sm" fontWeight="bold" mt={2}>
                  {config.escalationThresholds?.responseTime || 20}s
                </Text>
              </FormControl>
            </SimpleGrid>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleSaveConfig}
              isLoading={saving}
              width="full"
            >
              Save Thresholds
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Capabilities */}
      {config && (
        <Card bg={bgColor} mt={6}>
          <CardHeader>
            <Heading size="md">Agent Capabilities</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {config.capabilities?.map(capability => (
                <HStack key={capability.id} justify="space-between" p={3} bg={itemBg} borderRadius="md">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm">{capability.name}</Text>
                    <Text fontSize="xs" color="gray.500">{capability.id}</Text>
                  </VStack>
                  <Switch
                    isChecked={capability.enabled}
                    onChange={() => handleCapabilityToggle(capability.id)}
                  />
                </HStack>
              ))}
            </SimpleGrid>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleSaveConfig}
              isLoading={saving}
              width="full"
            >
              Save Capabilities
            </Button>
          </CardFooter>
        </Card>
      )}
    </Box>
  );
};

export default AgentConfig;
