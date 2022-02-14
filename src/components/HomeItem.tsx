import { Badge, Typography } from "@mui/material";


function HomeItem(props: {icon: string, name?: string, badge?: number}) {
    return <div style={{width: '4.5rem'}}>
            <div>
                <Typography fontSize="2rem" align="center">
                    {props.badge ?
                        <Badge badgeContent={props.badge} color="default">{props.icon}</Badge>
                                 :
                        props.icon}
                </Typography>
            </div>
            {props.name && 
            <div>
                <Typography align="center" fontSize="small">
                    {props.name}
                </Typography>
            </div>
            }
        </div>;
}

export default HomeItem;