import { Badge, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React from 'react';
import { SyntheticEvent } from 'react';


function HomeItem(props: {icon: string, name?: string, badge?: number, click?: () => void, menu?:Array<{name: string, action:(ev: SyntheticEvent) => void}>, clickOpensMenu?: boolean, title?: string, published?: boolean, dense?: boolean}) {

    const [anchorEl, setAnchorEl] = React.useState<undefined | HTMLElement>(undefined);

    const open = anchorEl !== undefined;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement|HTMLAnchorElement>) => {
        if (props.clickOpensMenu) {
            setAnchorEl(event.currentTarget);
        } else if (props.click !== undefined) {
            props.click();
        }

        event.preventDefault();
    };

    const handleContextClick = (event: React.MouseEvent<HTMLButtonElement|HTMLAnchorElement>) => {
        setAnchorEl(event.currentTarget);
        event.preventDefault();
    }

    const handleMenuClose = () => {
        setAnchorEl(undefined);
    };

    const addBadge = (icon: React.ReactElement, name?: string) => {
        if (props.published) {
            return <Badge badgeContent={<div style={{backgroundColor:"#22cc22", borderRadius: '2px', padding: '2px', marginLeft:'-40px', color: '#ffffff'}}>shared</div>}>{icon}</Badge>;
            //return <Badge badgeContent={<img src="icons/streamline-icon-satellite-1@48x48.png" height="19px" width="19px" style={{backgroundColor:"#e8e8e8", borderRadius: '8px', padding: '2px'}}/>}>{icon}</Badge>;
        } else {
            return icon;
        }
    }


    return <div style={{width: '4.5rem', paddingBottom: (props.dense? 'inherit' : '1rem')}}>
            <div title={props.title}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                {addBadge(<IconButton onClick={handleClick} onContextMenu={handleContextClick}><img src={'icons/' + props.icon} style={{width:'32px', height:'32px'}}/></IconButton>, props.name)}
                {/*<Typography fontSize="2rem" align="center">
                    {props.badge ?
                        <Badge badgeContent={props.badge} color="default"><a style={{textDecoration: 'none'}} href="#">{props.icon}</a></Badge>
                                 :
                        <a style={{textDecoration: 'none'}} href="#">{props.icon}</a>}
                    </Typography>*/}
                </div>
            </div>
            {props.name && 
            <div style={{paddingTop:'0.1rem'}}>
                <Typography align="center" fontSize="small" style={{overflowWrap:'break-word'}}>
                <a style={{textDecoration: 'none'}} onClick={handleClick} onContextMenu={handleContextClick} href="#">{props.name}</a>
                </Typography>
            </div>
            }
            {props.menu && props.menu.length > 0 && 

                <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                >
                    {props.menu.map((item: {name: string, action: (ev: SyntheticEvent) => void}) => <MenuItem key={item.name} onClick={(ev: any) => { handleMenuClose(); return item.action(ev); } }><Typography fontSize="small">{item.name}</Typography></MenuItem>)}
                </Menu>

            }
        </div>;
}

export default HomeItem;