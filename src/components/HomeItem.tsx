import { Badge, Typography } from "@mui/material";


function HomeItem(props: {icon: string, name?: string, badge?: number}) {
    return <div style={{width: '4.5rem'}}>
            <div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <img src={'icons/' + props.icon} style={{width:'32px', height:'32px'}}/>
                {/*<Typography fontSize="2rem" align="center">
                    {props.badge ?
                        <Badge badgeContent={props.badge} color="default"><a style={{textDecoration: 'none'}} href="#">{props.icon}</a></Badge>
                                 :
                        <a style={{textDecoration: 'none'}} href="#">{props.icon}</a>}
                    </Typography>*/}
                </div>
            </div>
            {props.name && 
            <div style={{paddingTop:'0.5rem'}}>
                <Typography align="center" fontSize="small">
                <a style={{textDecoration: 'none'}} href="#">{props.name}</a>
                </Typography>
            </div>
            }
        </div>;
}

export default HomeItem;