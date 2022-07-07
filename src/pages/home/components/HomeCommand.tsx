import { Badge, Button, Tooltip } from '@mui/material';


function HomeCommand(props: {icon: string, title: string, badge?: number, action: () => void}) {

    const image = <a href="#"><img  src={'icons/' + props.icon} style={{width:'30px', height:'30px', margin:'2px', padding: '2px'}}/></a>;

    let inner = image;

    if (props.badge !== undefined) {
        inner = <Badge badgeContent={props.badge} color="success">{inner}</Badge>;
    }

    const button = <Button size="medium" onClick={(ev) => {ev.preventDefault(); props.action()}}>
                    {inner}
                  </Button>;

    



    return  <Tooltip title={props.title} placement="top" arrow>
                
                    {button}
                
            </Tooltip>;
}

export default HomeCommand;