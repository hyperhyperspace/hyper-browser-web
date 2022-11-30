import { Hash } from "@hyper-hyper-space/core";
import { Home } from "@hyper-hyper-space/home";
import {
  Avatar,
  Chip,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/material";
import { ReactElement } from "react";
import { useOutletContext } from "react-router";
import { Contact } from "../../../model/ProfileUtils";
import { SpaceContext } from "../../space/SpaceFrame";

export default (props: {
  contact: Contact;
  selfHash?: Hash;
  chips?: Array<ReactElement>;
}) => {
  const { contact } = props;
  return (
    <>
      <ListItemIcon>
        {contact.picture !== undefined && (
          <Avatar alt={contact.name} src={contact.picture} />
        )}
        {contact.picture === undefined && (
          <Avatar alt={contact.name}>{contact.initials}</Avatar>
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1}>
            <Typography>{contact.name}</Typography>
            {contact.hash === props.selfHash && (
              <Chip size="small" label="You" />
            )}
            { props.chips }
          </Stack>
        }
        secondary={contact.code}
      />
    </>
  );
};
