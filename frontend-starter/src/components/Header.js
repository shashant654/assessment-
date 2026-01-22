// src/components/Header.js
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Button,
  Badge,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Text,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiMenu, 
  FiBell, 
  FiMoon, 
  FiSun,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiHome,
  FiMessageCircle,
  FiBarChart2,
  FiFileText,
  FiLogOut,
} from 'react-icons/fi';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';

  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Conversations', icon: FiMessageCircle, path: '/conversations' },
    { name: 'AI Agent', icon: FiSettings, path: '/agent-config' },
    { name: 'Analysis', icon: FiBarChart2, path: '/analysis' },
    { name: 'Templates', icon: FiFileText, path: '/templates' },
  ];

  const isActive = (path) => location.pathname === path;
  
  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={{ base: 2, md: 4 }}
        py={2}
        zIndex={10}
        ml={{ base: 0, md: '250px' }}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" flex={1}>
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="ghost"
              mr={2}
              onClick={onOpen}
            />
            <InputGroup maxW={{ base: '200px', sm: '300px', md: '400px' }} display={{ base: 'none', sm: 'block' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input placeholder="Search..." size={{ base: 'sm', md: 'md' }} />
            </InputGroup>
            <IconButton
              display={{ base: 'flex', sm: 'none' }}
              aria-label="Search"
              icon={<FiSearch />}
              variant="ghost"
            />
          </Flex>
          
          <Flex align="center" gap={{ base: 0, md: 1 }}>
            <Tooltip label="Toggle color mode">
              <IconButton
                aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                variant="ghost"
                onClick={toggleColorMode}
                size={{ base: 'sm', md: 'md' }}
              />
            </Tooltip>
            
            <Menu>
              <Tooltip label="Notifications">
                <Box position="relative">
                  <MenuButton
                    as={IconButton}
                    aria-label="Notifications"
                    icon={<FiBell />}
                    variant="ghost"
                    size={{ base: 'sm', md: 'md' }}
                  />
                  <Badge
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    borderRadius="full"
                    bg="red.500"
                    color="white"
                    fontSize="xs"
                    w={4}
                    h={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    3
                  </Badge>
                </Box>
              </Tooltip>
              <MenuList>
                <MenuItem>New alert: High priority conversation</MenuItem>
                <MenuItem>Agent configuration updated</MenuItem>
                <MenuItem>System maintenance scheduled</MenuItem>
              </MenuList>
            </Menu>
            
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<FiUser />}
                borderRadius="md"
                px={{ base: 1, md: 3 }}
                py={2}
                fontSize={{ base: 'sm', md: 'md' }}
                display={{ base: 'none', sm: 'flex' }}
              >
                Supervisor
              </MenuButton>
              <MenuButton
                as={IconButton}
                aria-label="User menu"
                icon={<FiUser />}
                variant="ghost"
                display={{ base: 'flex', sm: 'none' }}
                size="sm"
              />
              <MenuList>
                <MenuItem icon={<FiUser />}>Profile</MenuItem>
                <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                <MenuItem icon={<FiHelpCircle />}>Help</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              Zangoh AI Supervisor
            </Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  variant="ghost"
                  justifyContent="flex-start"
                  py={6}
                  px={6}
                  leftIcon={<Icon as={item.icon} boxSize={5} />}
                  bg={isActive(item.path) ? 'brand.50' : 'transparent'}
                  color={isActive(item.path) ? 'brand.500' : 'gray.700'}
                  borderRadius={0}
                  borderLeft={isActive(item.path) ? '3px solid' : 'none'}
                  borderColor="brand.500"
                  _hover={{
                    bg: 'brand.50',
                    color: 'brand.500',
                  }}
                  onClick={onClose}
                >
                  {item.name}
                </Button>
              ))}
              <Divider my={4} />
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                px={6}
                leftIcon={<Icon as={FiHelpCircle} boxSize={5} />}
                color="gray.600"
                borderRadius={0}
                _hover={{
                  bg: 'gray.100',
                }}
              >
                Help & Resources
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                py={6}
                px={6}
                leftIcon={<Icon as={FiLogOut} boxSize={5} />}
                color="gray.600"
                borderRadius={0}
                _hover={{
                  bg: 'gray.100',
                }}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
