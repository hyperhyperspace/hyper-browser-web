import { Badge, Button, Tooltip } from '@mui/material';


function HomeCommand(props: {icon: string, title: string, badge?: number}) {

    const image = <img  src={'icons/' + props.icon} style={{width:'30px', height:'30px', margin:'2px', padding: '2px'}}/>;

    let inner = image;

    if (props.badge !== undefined) {
        inner = <Badge badgeContent={props.badge} color="success">{inner}</Badge>;
    }

    const button = <Button size="medium">
                    {inner}
                  </Button>;

    



    return  <Tooltip title={props.title} placement="top" arrow>
                
                    {button}
                
            </Tooltip>;
}

export default HomeCommand;