import {
  Box,
  Chip,
  createTheme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import { roleShareMenu } from "constants/menuItem.constant";

interface ActionPreviewTypes {
  accessStatusShare: string;
  statusshare: string;
  handleStatus: (value: string) => void;
}
export default function ActionPreviewCreateShare(props: ActionPreviewTypes) {
  const theme = createTheme();

  const { statusshare, handleStatus } = props;
  return (
    <MenuDropdown
      customButton={{
        element: (
          <Box>
            <Chip
              size="small"
              sx={{ cursor: "pointer" }}
              label={`${statusshare === "view" ? "Can view" : "Can edit"}`}
            />
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
