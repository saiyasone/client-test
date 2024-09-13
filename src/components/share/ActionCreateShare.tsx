import { Box, Button, useMediaQuery } from "@mui/material";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import { roleShareMenu } from "constants/menuItem.constant";

import { MdOutlineExpandMore } from "react-icons/md";
export default function ActionCreateShare(props) {
  const { statusshare, handleStatus } = props;
  const isSmallMobile = useMediaQuery("(max-width:768px)");
  return (
    <MenuDropdown
      customButton={{
        element: (
          <Box
            sx={{
              margin: isSmallMobile ? "10px 0px 0 0" : "0px 0 0 10px",
              height: "100%",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              sx={{
                height: "100%",
                width:  "120px",
              }}
              endIcon={<MdOutlineExpandMore />}
              {...{
                ...(props.accessStatusShare === "private"
                  ? {}
                  : {
                      disabled: true,
                    }),
              }}
            >
              {statusshare === "view" ? "Can view" : "Can edit"}
            </Button>
          </Box>
        ),
      }}
    >
      {props.accessStatusShare === "private" && (
        <div>
          {roleShareMenu.map((menuItem, index) => {
            return (
              <MenuDropdownItem
                statusshare={statusshare}
                key={index}
                title={menuItem.title}
                icon={menuItem.icon}
                {...{
                  ...(props.accessStatusShare === "private"
                    ? {
                        onClick: () => handleStatus(menuItem.action),
                      }
                    : {
                        disabled: true,
                      }),
                }}
              />
            );
          })}
        </div>
      )}
    </MenuDropdown>
  );
}
