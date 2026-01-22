// src/pages/Conversations.js
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import ConversationList from '../components/ConversationList';
import { createConversation } from '../api';

const Conversations = () => {
  const { conversations, loading, error, agents, refreshData } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refreshData) {
      await refreshData();
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateConversation = async () => {
    if (!customerName.trim()) {
      toast({
        title: 'Customer name is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setCreating(true);
      const newConversation = await createConversation(
        customerName,
        customerId || undefined,
        selectedAgent || undefined
      );
      
      toast({
        title: 'Conversation created',
        description: `New conversation started with ${customerName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setCustomerName('');
      setCustomerId('');
      setSelectedAgent('');
      onClose();
      
      // Refresh data and navigate to the new conversation
      if (refreshData) {
        await refreshData();
      }
      navigate(`/conversation/${newConversation.id}`);
    } catch (err) {
      toast({
        title: 'Error creating conversation',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setCustomerName('');
    setCustomerId('');
    setSelectedAgent('');
    onClose();
  };

  return (
    <Box>
      <Flex 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }} 
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }}>Conversations</Heading>
          <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
            View and manage all customer conversations
          </Text>
        </Box>

        <HStack spacing={2}>
          <Button
            leftIcon={<FiPlus />}
            size={{ base: 'sm', md: 'md' }}
            colorScheme="blue"
            onClick={onOpen}
          >
            New Conversation
          </Button>
          <Button
            leftIcon={<FiRefreshCw />}
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            isLoading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <ConversationList 
        conversations={conversations}
        loading={loading.conversations}
        error={error.conversations}
      />

      {/* Create Conversation Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Customer ID (Optional)</FormLabel>
                <Input
                  placeholder="e.g., cust-12345"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Assign Agent (Optional)</FormLabel>
                <Select
                  placeholder="Auto-assign agent"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {agents && agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateConversation}
              isLoading={creating}
            >
              Create Conversation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Conversations;
