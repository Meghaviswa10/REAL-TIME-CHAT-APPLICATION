import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      variant="solid"
      colorScheme={admin ? "purple" : "teal"}
      cursor="pointer"
      onClick={handleFunction}
    >
      {user.name}
      {admin && <CloseIcon pl={1} />}
    </Badge>
  );
};

export default UserBadgeItem;
