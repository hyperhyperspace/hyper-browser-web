import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React from 'react';
import { SyntheticEvent } from 'react';


function HomeItem(props: {icon: string, name?: string, badge?: number, click?: () => void, menu?:Array<{name: string, action:(ev: SyntheticEvent) => void}>, clickOpensMenu?: boolean}) {

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

    return <div style={{width: '4.5rem'}}>
            <div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <IconButton onClick={handleClick} onContextMenu={handleContextClick}><img src={'icons/' + props.icon} style={{width:'32px', height:'32px'}}/></IconButton>
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