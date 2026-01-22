// src/pages/ConversationView.js
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Divider,
  Input,
  useToast,
  Badge,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  IconButton,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Select,
  FormControl,
  FormLabel,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  InputGroup,
  Collapse,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiClock,
  FiThumbsUp,
  FiAlertCircle,
  FiSend,
  FiPlayCircle,
  FiStopCircle,
  FiFileText,
  FiMic,
  FiX,
  FiInfo,
  FiCheck,
} from "react-icons/fi";
import { useAppData } from "../context/AppDataContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  getConversation,
  addMessage,
  interveneInConversation,
  releaseIntervention,
  getTemplates,
  applyTemplate,
} from "../api";

const ConversationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const { conversations } = useAppData();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Speech Recognition
  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isIntervening, setIsIntervening] = useState(false);
  const [interventionNotes, setInterventionNotes] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateVariables, setTemplateVariables] = useState({});
  const [templatePreview, setTemplatePreview] = useState("");
  const [templateCategory, setTemplateCategory] = useState("all");
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  const {
    isOpen: isTemplateModalOpen,
    onOpen: onTemplateModalOpen,
    onClose: onTemplateModalClose,
  } = useDisclosure();
  const {
    isOpen: isReleaseModalOpen,
    onOpen: onReleaseModalOpen,
    onClose: onReleaseModalClose,
  } = useDisclosure();
  const {
    isOpen: isSidebarOpen,
    onOpen: onSidebarOpen,
    onClose: onSidebarClose,
  } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const sidebarBg = useColorModeValue("gray.50", "gray.700");
  const messageBg = useColorModeValue("blue.50", "blue.900");
  const customerBg = useColorModeValue("gray.100", "gray.600");
  const voicePanelBg = useColorModeValue("blue.50", "blue.900");

  useEffect(() => {
    loadConversation();
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Update from context if available
    const conv = conversations.find((c) => c.id === id || c._id === id);
    if (conv) {
      setConversation((prev) => ({ ...prev, ...conv }));
      setIsIntervening(
        conv.status === "escalated" && conv.humanIntervention?.occurred,
      );
    }
  }, [conversations, id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const data = await getConversation(id);
      setConversation(data);
      setIsIntervening(
        data.status === "escalated" && data.humanIntervention?.occurred,
      );
    } catch (error) {
      toast({
        title: "Error loading conversation",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const newMessage = {
        sender: isIntervening ? "supervisor" : "agent",
        text: messageText,
      };

      await addMessage(conversation.id, newMessage);

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, { ...newMessage, timestamp: new Date() }],
      }));

      setMessageText("");

      toast({
        title: "Message sent",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleIntervene = async () => {
    try {
      await interveneInConversation(
        conversation.id,
        "supervisor-001",
        interventionNotes,
      );

      setIsIntervening(true);
      setInterventionNotes("");

      toast({
        title: "Intervention started",
        description: "You have taken control of this conversation",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      await loadConversation();
    } catch (error) {
      toast({
        title: "Error intervening",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReleaseControl = async () => {
    try {
      await releaseIntervention(conversation.id, interventionNotes);

      setIsIntervening(false);
      setInterventionNotes("");
      onReleaseModalClose();

      toast({
        title: "Control released",
        description: "AI agent has resumed control",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await loadConversation();
    } catch (error) {
      toast({
        title: "Error releasing control",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Voice input handlers
  const handleStartVoiceInput = () => {
    setShowVoicePanel(true);
    startListening();
    toast({
      title: "🎤 Voice Input Active",
      description: "Start speaking. Your words will appear in real-time.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStopVoiceInput = () => {
    stopListening();
    if (transcript) {
      setMessageText((prev) => (prev ? prev + " " + transcript : transcript));
      toast({
        title: "✓ Voice input added",
        description: `Added: "${transcript.substring(0, 50)}${transcript.length > 50 ? "..." : ""}"`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
    resetTranscript();
    setShowVoicePanel(false);
  };

  const handleCancelVoiceInput = () => {
    stopListening();
    resetTranscript();
    setShowVoicePanel(false);
    toast({
      title: "Voice input cancelled",
      status: "info",
      duration: 1500,
      isClosable: true,
    });
  };

  const handleAppendTranscript = () => {
    if (transcript) {
      setMessageText((prev) => (prev ? prev + " " + transcript : transcript));
      resetTranscript();
    }
  };

  // Update template preview when variables change
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        let preview = template.content;
        if (templateVariables && typeof templateVariables === "object") {
          Object.keys(templateVariables).forEach((key) => {
            const value = templateVariables[key] || `{{${key}}}`;
            const regex = new RegExp(`{{${key}}}`, "g");
            preview = preview.replace(regex, value);
          });
        }
        setTemplatePreview(preview);
      }
    } else {
      setTemplatePreview("");
    }
  }, [selectedTemplate, templateVariables, templates]);

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const template = templates.find((t) => t.id === selectedTemplate);

      if (template.variables && template.variables.length > 0) {
        // Check if all variables are filled
        const missingVars = template.variables.filter(
          (v) => !templateVariables[v.name] || templateVariables[v.name].trim() === ""
        );
        
        if (missingVars.length > 0) {
          toast({
            title: "Missing variables",
            description: `Please fill in: ${missingVars.map((v) => v.name).join(", ")}`,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Apply variables
        const result = await applyTemplate(selectedTemplate, templateVariables);
        setMessageText(result.content);
      } else {
        setMessageText(template.content);
      }

      onTemplateModalClose();
      setSelectedTemplate("");
      setTemplateVariables({});
      setTemplateCategory("all");

      toast({
        title: "Template applied",
        description: "Template content has been added to your message",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error applying template",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);

    if (template && template.variables) {
      const vars = {};
      template.variables.forEach((v) => {
        vars[v.name] = "";
      });
      setTemplateVariables(vars);
    } else {
      setTemplateVariables({});
    }
  };

  const filteredTemplates = templateCategory === "all"
    ? templates
    : templates.filter((t) => t.category === templateCategory);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 1500,
    });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" mr={3} />
        <Text>Loading conversation...</Text>
      </Flex>
    );
  }

  if (!conversation) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" mb={4}>Conversation not found</Text>
        <Button colorScheme="brand" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  // Sidebar Content Component
  const SidebarContent = () => (
    <VStack align="stretch" spacing={6}>
      {/* Customer Info */}
      <Box>
        <Heading size="sm" mb={3}>
          Customer Information
        </Heading>
        <HStack mb={3}>
          <Avatar name={conversation.customer?.name} size="md" />
          <Box>
            <Text fontWeight="bold">
              {conversation.customer?.name || "Unknown"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              ID: {conversation.customer?.id || "N/A"}
            </Text>
          </Box>
        </HStack>
      </Box>

      <Divider />

      {/* Agent Info */}
      <Box>
        <Heading size="sm" mb={3}>
          Agent Information
        </Heading>
        <Text fontWeight="medium">
          {conversation.agent?.name || "AI Agent"}
        </Text>
        <Text fontSize="sm" color="gray.600">
          ID: {conversation.agent?.id || "N/A"}
        </Text>
      </Box>

      <Divider />

      {/* Performance Metrics */}
      <Box>
        <Heading size="sm" mb={3}>
          Performance Metrics
        </Heading>
        <VStack align="stretch" spacing={3}>
          <Stat>
            <StatLabel>
              <HStack>
                <FiClock />
                <Text>Response Time</Text>
              </HStack>
            </StatLabel>
            <StatNumber>
              {conversation.metrics?.responseTime || 0}s
            </StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              23% faster
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>
              <HStack>
                <FiThumbsUp />
                <Text>Sentiment</Text>
              </HStack>
            </StatLabel>
            <StatNumber>
              {conversation.metrics?.sentiment
                ? `${Math.round(conversation.metrics.sentiment * 100)}%`
                : "N/A"}
            </StatNumber>
            <StatHelpText>
              {conversation.metrics?.sentiment > 0.7 ? (
                <>
                  <StatArrow type="increase" />
                  Positive
                </>
              ) : (
                <>
                  <StatArrow type="decrease" />
                  Needs attention
                </>
              )}
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>
              <HStack>
                <FiUser />
                <Text>Confidence Score</Text>
              </HStack>
            </StatLabel>
            <StatNumber>
              {conversation.metrics?.confidenceScore
                ? `${Math.round(conversation.metrics.confidenceScore * 100)}%`
                : "N/A"}
            </StatNumber>
          </Stat>
        </VStack>
      </Box>

      {/* Intervention Info */}
      {conversation.humanIntervention?.occurred && (
        <>
          <Divider />
          <Box>
            <Heading size="sm" mb={3}>
              Intervention Details
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm">
                <strong>Supervisor:</strong>{" "}
                {conversation.humanIntervention.supervisorId}
              </Text>
              <Text fontSize="sm">
                <strong>Time:</strong>{" "}
                {new Date(
                  conversation.humanIntervention.timestamp,
                ).toLocaleString()}
              </Text>
              {conversation.humanIntervention.notes && (
                <Text fontSize="sm">
                  <strong>Notes:</strong>{" "}
                  {conversation.humanIntervention.notes}
                </Text>
              )}
            </VStack>
          </Box>
        </>
      )}

      {/* Tags */}
      {conversation.tags && conversation.tags.length > 0 && (
        <>
          <Divider />
          <Box>
            <Heading size="sm" mb={3}>
              Tags
            </Heading>
            <Flex wrap="wrap" gap={2}>
              {conversation.tags.map((tag, index) => (
                <Badge key={index} colorScheme="purple">
                  {tag}
                </Badge>
              ))}
            </Flex>
          </Box>
        </>
      )}
    </VStack>
  );

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={4}
        p={{ base: 3, md: 4 }}
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        direction={{ base: "column", md: "row" }}
        gap={3}
      >
        <HStack spacing={3} flex={1} minW={0}>
          <IconButton
            icon={<FiArrowLeft />}
            onClick={() => navigate("/")}
            variant="ghost"
            aria-label="Back to dashboard"
            size={{ base: "sm", md: "md" }}
          />
          <Box minW={0} flex={1}>
            <Heading size={{ base: "sm", md: "md" }} noOfLines={1}>
              {conversation.customer?.name || "Customer"}
            </Heading>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" noOfLines={1}>
              ID: {conversation.id}
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={
                conversation.status === "active"
                  ? "green"
                  : conversation.status === "escalated"
                    ? "red"
                    : conversation.status === "resolved"
                      ? "blue"
                      : "gray"
              }
              fontSize={{ base: "xs", md: "sm" }}
            >
              {conversation.status}
            </Badge>
            {conversation.alertLevel === "high" && (
              <Badge colorScheme="red" fontSize={{ base: "xs", md: "sm" }}>
                <HStack spacing={1}>
                  <FiAlertCircle size={12} />
                  <Text>High Alert</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </HStack>

        <HStack spacing={2}>
          {/* Mobile: Info button to open sidebar drawer */}
          {isMobile && (
            <IconButton
              icon={<FiInfo />}
              onClick={onSidebarOpen}
              variant="outline"
              aria-label="View details"
              size="sm"
            />
          )}
          {!isIntervening ? (
            <Button
              leftIcon={<FiPlayCircle />}
              colorScheme="orange"
              onClick={handleIntervene}
              size={{ base: "sm", md: "md" }}
            >
              {isMobile ? "Control" : "Take Control"}
            </Button>
          ) : (
            <Button
              leftIcon={<FiStopCircle />}
              colorScheme="green"
              onClick={onReleaseModalOpen}
              size={{ base: "sm", md: "md" }}
            >
              Release
            </Button>
          )}
        </HStack>
      </Flex>

      <Flex gap={4} direction={{ base: "column", lg: "row" }}>
        {/* Main Chat Area */}
        <Box flex="2" bg={bgColor} borderRadius="lg" boxShadow="md" p={{ base: 3, md: 6 }}>
          <VStack
            align="stretch"
            spacing={4}
            height={{ base: "calc(100vh - 400px)", md: "calc(100vh - 300px)" }}
            overflowY="auto"
            mb={4}
          >
            {conversation.messages &&
              conversation.messages.map((msg, index) => (
                <Flex
                  key={index}
                  justify={
                    msg.sender === "customer" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bg={msg.sender === "customer" ? customerBg : messageBg}
                    p={3}
                    borderRadius="lg"
                    maxWidth={{ base: "85%", md: "70%" }}
                  >
                    <HStack mb={1} flexWrap="wrap">
                      <Text
                        fontWeight="bold"
                        fontSize={{ base: "xs", md: "sm" }}
                        textTransform="capitalize"
                      >
                        {msg.sender}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Text>
                    </HStack>
                    <Text fontSize={{ base: "sm", md: "md" }}>{msg.text}</Text>
                  </Box>
                </Flex>
              ))}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Voice Input Panel */}
          <Collapse in={showVoicePanel || isListening} animateOpacity>
            <Box
              bg={voicePanelBg}
              p={4}
              borderRadius="lg"
              mb={3}
              border="2px solid"
              borderColor="blue.300"
            >
              <VStack spacing={3}>
                <HStack justify="space-between" width="full">
                  <HStack>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={isListening ? "red.500" : "gray.400"}
                      animation={isListening ? "pulse 1s infinite" : "none"}
                    />
                    <Text fontWeight="medium" fontSize="sm">
                      {isListening ? "🎤 Listening..." : "Voice Input"}
                    </Text>
                  </HStack>
                  <IconButton
                    icon={<FiX />}
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelVoiceInput}
                    aria-label="Cancel voice input"
                  />
                </HStack>
                
                {transcript && (
                  <Box
                    bg="white"
                    p={3}
                    borderRadius="md"
                    width="full"
                    minH="60px"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize="sm" fontStyle={isListening ? "italic" : "normal"}>
                      {transcript}
                    </Text>
                  </Box>
                )}

                <HStack spacing={2} width="full" justify="flex-end">
                  {transcript && (
                    <Button
                      size="sm"
                      leftIcon={<FiCheck />}
                      colorScheme="green"
                      onClick={handleStopVoiceInput}
                    >
                      Add to Message
                    </Button>
                  )}
                  {!isListening && (
                    <Button
                      size="sm"
                      leftIcon={<FiMic />}
                      colorScheme="blue"
                      onClick={startListening}
                    >
                      Start Again
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Box>
          </Collapse>

          {voiceError && (
            <Alert status="warning" mb={3} borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">{voiceError}</Text>
            </Alert>
          )}

          {/* Message Input */}
          <Box>
            <HStack spacing={2} align="flex-end">
              <Tooltip label="Use template">
                <IconButton
                  icon={<FiFileText />}
                  onClick={onTemplateModalOpen}
                  variant="outline"
                  aria-label="Use template"
                  size={{ base: "sm", md: "md" }}
                />
              </Tooltip>

              {isSpeechSupported && !showVoicePanel && (
                <Tooltip label="Voice input">
                  <IconButton
                    icon={<FiMic />}
                    onClick={handleStartVoiceInput}
                    variant="outline"
                    aria-label="Voice input"
                    size={{ base: "sm", md: "md" }}
                  />
                </Tooltip>
              )}

              <InputGroup flex={1}>
                <Input
                  placeholder={
                    isIntervening
                      ? "Send message as supervisor..."
                      : "Type a message..."
                  }
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={
                    (!isIntervening && conversation.status === "escalated") ||
                    isListening
                  }
                  size={{ base: "sm", md: "md" }}
                  pr="4rem"
                />
              </InputGroup>

              <Button
                leftIcon={<FiSend />}
                colorScheme="blue"
                onClick={handleSendMessage}
                disabled={
                  !messageText.trim() ||
                  (!isIntervening && conversation.status === "escalated")
                }
                size={{ base: "sm", md: "md" }}
              >
                {isMobile ? "" : "Send"}
              </Button>
            </HStack>

            {!isIntervening && conversation.status !== "escalated" && (
              <Text fontSize="xs" color="orange.500" mt={2}>
                Note: Messages sent without intervention are from the AI agent
              </Text>
            )}

            {isSpeechSupported && !showVoicePanel && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                💡 Click microphone to use voice input
              </Text>
            )}

            {!isSpeechSupported && (
              <Text fontSize="xs" color="orange.500" mt={2}>
                ⚠️ Voice input not supported in your browser
              </Text>
            )}
          </Box>
        </Box>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            flex="1"
            bg={sidebarBg}
            borderRadius="lg"
            boxShadow="md"
            p={6}
            maxH="calc(100vh - 200px)"
            overflowY="auto"
          >
            <SidebarContent />
          </Box>
        )}
      </Flex>

      {/* Mobile Sidebar Drawer */}
      <Drawer isOpen={isSidebarOpen} placement="right" onClose={onSidebarClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Conversation Details</DrawerHeader>
          <DrawerBody>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={onTemplateModalClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Use Response Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Select Template</FormLabel>
                <Select
                  placeholder="Choose a template"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedTemplateData && (
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Preview:
                  </Text>
                  <Text fontSize="sm">{selectedTemplateData.content}</Text>
                </Box>
              )}

              {selectedTemplateData?.variables &&
                selectedTemplateData.variables.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Fill in variables:
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      {selectedTemplateData.variables.map((variable) => (
                        <FormControl key={variable.name}>
                          <FormLabel fontSize="sm">
                            {variable.name}
                            <Text
                              as="span"
                              fontSize="xs"
                              color="gray.500"
                              ml={2}
                            >
                              ({variable.description})
                            </Text>
                          </FormLabel>
                          <Input
                            size="sm"
                            value={templateVariables[variable.name] || ""}
                            onChange={(e) =>
                              setTemplateVariables({
                                ...templateVariables,
                                [variable.name]: e.target.value,
                              })
                            }
                            placeholder={`Enter ${variable.name}`}
                          />
                        </FormControl>
                      ))}
                    </VStack>
                  </Box>
                )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUseTemplate}
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Release Control Modal */}
      <Modal isOpen={isReleaseModalOpen} onClose={onReleaseModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Release Control to AI Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Supervisor Notes (Optional)</FormLabel>
              <Textarea
                value={interventionNotes}
                onChange={(e) => setInterventionNotes(e.target.value)}
                placeholder="Add any notes for the AI agent to continue the conversation..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onReleaseModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleReleaseControl}>
              Release Control
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ConversationView;
