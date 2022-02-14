import { Badge, Button, Tooltip } from "@mui/material";


function HomeCommand(props: {icon: string, title: string, badge?: number}) {
    return  <Tooltip title={props.title} placement="top" arrow>
                <Button size="medium" sx={{fontSize: {xs: '1.5rem', sm: '1.8rem', md: '2rem'}}}>
                    { props.badge ? 
                            <Badge badgeContent={props.badge} color="info">{props.icon}</Badge> 
                                  :
                            props.icon
                    }
                </Button>
            </Tooltip>;
}

export default HomeCommand;