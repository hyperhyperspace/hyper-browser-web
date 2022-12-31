import { Typography } from "@mui/material";

export const ReadInfo = (
  <Typography>
    <p>
      Peers who have <u><b>read</b></u> permission will receive new wiki updates from other
      peers.
    </p>
    <p>
      <b>Important:</b> This permission is enforced through trust that all peers are
      running software that honors this setting.  There is no strong guarantee that this permission can be enforced.
    </p>
    <p>
        When someone's <u><b>read</b></u> permission is revoked, they will still be able to read any content that was
        sent to them by peers before revocation occured.
    </p>
  </Typography>
);

export const WriteInfo = (
  <Typography>
    <p>
      Peers who have <u><b>write</b></u> permission will be able to cryptographically verify that their wiki updates adhere to this setting.
    </p>
    <p>
      <b>Important:</b> If this permission is revoked but the revocation information hasn't made its way to all peers, it's possible that someone's additions
      could appear to be valid until the revocation notice is recieved.  In order to prevent this, please try and ensure that all peers are sharing updates regularly.
    </p>
  </Typography>
);

export const MemberInfo = (
  <Typography>
    <p>Wiki <b>membership</b> can be used to control various permissions in the wiki.  For example, editing the wiki can be restricted to members only.</p>
    <p>Additionally, two special kinds of members can be designated:</p>
    <ul>
        <li><b>Owners</b> are designated at the time of the wiki's creation and cannot be changed.  Owners have the ability to add and remove members and to designate certain members as moderators.</li>
        <li><b>Moderators</b> are members who can add and remove members.  Moderators can only be designated by the wiki's owners</li>
    </ul>
  </Typography>
);
