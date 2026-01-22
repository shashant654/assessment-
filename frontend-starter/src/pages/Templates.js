// src/pages/Templates.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Text,
  Flex,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiCopy,
  FiFileText,
} from "react-icons/fi";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../api";

const CATEGORIES = [
  "Greeting",
  "Problem Resolution",
  "Escalation",
  "Follow-up",
  "Closing",
  "Apology",
  "Information",
  "Other",
];

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const toast = useToast();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [formData, setFormData] = useState({
    name: "",
    category: "Greeting",
    content: "",
    variables: [],
    isShared: false,
  });

  const [newVariable, setNewVariable] = useState({ name: "", description: "" });

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const variableBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "Error loading templates",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const template = await createTemplate({
        ...formData,
        createdBy: "supervisor-001", // In a real app, this would be the current user
      });

      setTemplates([...templates, template]);

      toast({
        title: "Template created",
        description: "Your response template has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onCreateClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error creating template",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      const updated = await updateTemplate(selectedTemplate.id, formData);

      setTemplates(
        templates.map((t) => (t.id === selectedTemplate.id ? updated : t)),
      );

      toast({
        title: "Template updated",
        description: "Your response template has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error updating template",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      await deleteTemplate(selectedTemplate.id);

      setTemplates(templates.filter((t) => t.id !== selectedTemplate.id));

      toast({
        title: "Template deleted",
        description: "Your response template has been deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Error deleting template",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables || [],
      isShared: template.isShared,
    });
    onEditOpen();
  };

  const openDeleteModal = (template) => {
    setSelectedTemplate(template);
    onDeleteOpen();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Greeting",
      content: "",
      variables: [],
      isShared: false,
    });
    setSelectedTemplate(null);
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.description) {
      setFormData({
        ...formData,
        variables: [...formData.variables, { ...newVariable }],
      });
      setNewVariable({ name: "", description: "" });
    }
  };

  const removeVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index),
    });
  };

  const copyTemplateContent = (content) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Content copied",
      status: "success",
      duration: 2000,
    });
  };

  const filteredTemplates =
    filterCategory === "all"
      ? templates
      : templates.filter((t) => t.category === filterCategory);

  if (loading) {
    return (
      <Box p={8}>
        <Text>Loading templates...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading fontSize="2xl">Response Templates</Heading>
          <Text color="gray.500" mt={1}>
            Manage reusable response templates with variable substitution
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="purple"
          onClick={onCreateOpen}
        >
          Create Template
        </Button>
      </Flex>

      {/* Filter */}
      <Flex mb={6} gap={3} align="center">
        <Text fontWeight="medium">Filter by category:</Text>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          maxW="250px"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Badge ml={2} colorScheme="purple">
          {filteredTemplates.length} templates
        </Badge>
      </Flex>

      {/* Templates Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredTemplates.map((template) => (
          <Box
            key={template.id}
            bg={cardBg}
            p={5}
            borderRadius="lg"
            boxShadow="sm"
            border={`1px solid ${borderColor}`}
            transition="all 0.2s"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
          >
            <Flex justify="space-between" align="start" mb={3}>
              <HStack>
                <FiFileText size={20} />
                <Heading size="sm">{template.name}</Heading>
              </HStack>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem
                    icon={<FiEdit2 />}
                    onClick={() => openEditModal(template)}
                  >
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<FiCopy />}
                    onClick={() => copyTemplateContent(template.content)}
                  >
                    Copy Content
                  </MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    onClick={() => openDeleteModal(template)}
                    color="red.500"
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>

            <HStack mb={3}>
              <Badge colorScheme="purple">{template.category}</Badge>
              {template.isShared && <Badge colorScheme="green">Shared</Badge>}
            </HStack>

            <Text fontSize="sm" color="gray.600" noOfLines={3} mb={3}>
              {template.content}
            </Text>

            {template.variables && template.variables.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>
                  Variables:
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {template.variables.map((v, index) => (
                    <Badge key={index} colorScheme="blue" fontSize="xs">
                      {`{{${v.name}}}`}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>

      {filteredTemplates.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500">
            No templates found in this category
          </Text>
          <Button mt={4} colorScheme="purple" onClick={onCreateOpen}>
            Create Your First Template
          </Button>
        </Box>
      )}

      {/* Create/Edit Template Modal */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={isCreateOpen ? onCreateClose : onEditClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            {isCreateOpen ? "Create New Template" : "Edit Template"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Use double curly braces to define variables:{" "}
                  {`{{variableName}}`}
                </AlertDescription>
              </Alert>

              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Greeting - New Customer"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Template Content</FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Hello {{customerName}}, thank you for contacting us..."
                  rows={6}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Use {`{{variableName}}`} to insert variables that can be
                  filled in later
                </Text>
              </FormControl>

              <Divider />

              <Box>
                <FormLabel>Template Variables</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Define variables that will be substituted when using this
                  template
                </Text>

                {formData.variables.length > 0 && (
                  <VStack align="stretch" spacing={2} mb={3}>
                    {formData.variables.map((variable, index) => {
                      return (
                      <HStack
                        key={index}
                        p={3}
                        bg={variableBg}
                        borderRadius="md"
                        justify="space-between"
                      >
                        <Box>
                          <Text fontWeight="medium">{`{{${variable.name}}}`}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {variable.description}
                          </Text>
                        </Box>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeVariable(index)}
                        />
                      </HStack>
                    );
                    })}
                  </VStack>
                )}

                <HStack spacing={3}>
                  <FormControl>
                    <Input
                      size="sm"
                      value={newVariable.name}
                      onChange={(e) =>
                        setNewVariable({ ...newVariable, name: e.target.value })
                      }
                      placeholder="Variable name (e.g., customerName)"
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      size="sm"
                      value={newVariable.description}
                      onChange={(e) =>
                        setNewVariable({
                          ...newVariable,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                    />
                  </FormControl>
                  <Button size="sm" onClick={addVariable} colorScheme="blue">
                    Add
                  </Button>
                </HStack>
              </Box>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="share-template" mb="0">
                  Share with team
                </FormLabel>
                <input
                  id="share-template"
                  type="checkbox"
                  checked={formData.isShared}
                  onChange={(e) =>
                    setFormData({ ...formData, isShared: e.target.checked })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={isCreateOpen ? onCreateClose : onEditClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={
                isCreateOpen ? handleCreateTemplate : handleUpdateTemplate
              }
              disabled={!formData.name || !formData.content}
            >
              {isCreateOpen ? "Create Template" : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the template "
              {selectedTemplate?.name}"? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Templates;
