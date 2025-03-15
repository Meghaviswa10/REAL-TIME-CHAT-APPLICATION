import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ handleFunction }) => {
  const { user } = ChatState();

  return (
    <Box
      onClick={handleFunction}
      d="flex"
      alignItems="center"
      bg="#E8E8E8"
      p={3}
      borderRadius="lg"
      mt={2}
      cursor="pointer"
    >
      <Avatar name={user.name} src={user.pic} />
      <Text ml={4}>{user.name}</Text>
    </Box>
  );
};

export default UserListItem;
