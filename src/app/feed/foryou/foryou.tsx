import * as MUI from "./style/foryou.style";
import { Box } from '@mui/material';

const ForyouView = () => {

  return (
    <MUI.ContainerForyou
    >
        <MUI.VideoZone>
            <Box sx={{ width: 200, border: 1}}>

            </Box>
            <Box sx={{ width: 200, border: 1}}>

            </Box>
        </MUI.VideoZone>
    </MUI.ContainerForyou>
  )
}

export default ForyouView;