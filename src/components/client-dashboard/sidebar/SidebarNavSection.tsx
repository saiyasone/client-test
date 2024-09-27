import styled from "@emotion/styled";

import { Typography, useTheme } from "@mui/material";
import SidebarNavList from "./SidebarNavList";

const Title = styled(Typography)`
  // color: ${(props: any) => props.theme.sidebar.color};
  color: black
  font-size: ${(props: any) => props.theme.typography.caption.fontSize};
  padding: ${(props: any) => props.theme.spacing(4)}
    ${(props: any) => props.theme.spacing(7)} ${(props: any) =>
  props.theme.spacing(1)};
  opacity: 1;
  text-transform: uppercase;
  display: block;
`;

const SidebarNavSection = (props: any) => {
  const theme = useTheme()
  const {
    title,
    pages,
    // className,
    component: Component = "nav",
    ...rest
  } = props;

  return (
    title === 'SHORT' ?
    <Component {...rest}>
      {title && <Title variant="subtitle2" style={{opacity: 0.6, marginTop: 5, marginBottom: 3, userSelect: 'none'}}>{title}</Title>}
    </Component>
    :
    <Component {...rest}>
      {title && <Title variant="body2" sx={{color:theme.palette.grey[500]}}>{title}</Title>}
      <SidebarNavList pages={pages} depth={0} />
    </Component>
  );
};

export default SidebarNavSection;
