 /** From Version 5.2 Team:
 * We only fixed linting issues regarding Notifications.
 * Otherwise, Notifications still does not function properly.
 * Good luck!
 */

/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useContext, useEffect, useState, useRef } from 'react';

// MATERIAL UI METHODS
import {
  IconButton,
  Modal,
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import { BaseCSSProperties } from '@material-ui/core/styles/withStyles';

// MATERIAL UI ICONS
import AddCircleOutlineTwoToneIcon from '@material-ui/icons/AddCircleOutlineTwoTone';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DashboardIcon from '@material-ui/icons/Dashboard';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import PersonIcon from '@material-ui/icons/Person';
import UpdateIcon from '@material-ui/icons/Update';

// // MODALS
// import AddModal from '../modals/AddModal';
import EnvModal from '../modals/EnvModal';
import AddModal from '../modals/AddModal';
import AwsModal from '../modals/AwsModal';
import ProfileContainer from '../containers/ProfileContainer';
import ServicesModal from '../modals/ServicesModal';
import Search from './icons/Search';

// STYLESHEETS
import '../stylesheets/Occupied.scss';

// // CONTEXT
import { DashboardContext } from '../context/DashboardContext';
import { ApplicationContext } from '../context/ApplicationContext';
import { CommsContext } from '../context/CommsContext';
import { AwsContext } from '../context/AwsContext';
import { useNavigate } from 'react-router-dom';

// TYPESCRIPT
interface StyleProps {
  root: BaseCSSProperties;
}
type ClickEvent = React.MouseEvent<HTMLElement>;

// type OccupiedProps = {
//   switch: any;
//   setSwitch: any;
// };

//v10: Memoized function, witouth any props. Should theoretically be called only once.
const Occupied = React.memo(() => {
  const { awsData, fetchAwsData, fetchAwsAppInfo, setLoadingState } = useContext(AwsContext);
  const { setServicesData, app, setApp } = useContext(ApplicationContext);
  // const { user, getApplications, deleteApp, mode } = useContext(DashboardContext);
  const { user, applications, getApplications, deleteApp, mode } = useContext(DashboardContext);
  const { commsData } = useContext(CommsContext);
  const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
  // const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [personModalOpen, setPersonModalOpen] = useState<boolean>(false);
  const [envModalOpen, setEnvModalOpen] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [awsModalOpen, setAwsModalOpen] = useState<boolean>(false);
  const { appIndex, setAppIndex } = useContext(ApplicationContext);
  // const [index, setIndex] = useState<number>(0);
  // const [app, setApp] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [clickedAt, setClickedAt] = useState<string>('2000-01-01T00:00:00Z');

  // const [showAwsContainer, setShowAwsContainer] = useState(false);
  const navigate = useNavigate();


  // Grab services and applications whenever the user changes
  // v10: Runs once when Occupied is memoized, and subsequently when user is updated.
  useEffect(() => {
    setServicesData([]);
    getApplications();
  }, [user]);


  // Dynamic refs
  const delRef = useRef<any>([]);

  // Asks user to confirm deletion
  const confirmDelete = (event: ClickEvent, application: string, i: number) => {
    const message = `The application '${app}' will be permanently deleted. Continue?`;
    if (confirm(message)) deleteApp(i);
  };

  // Handle clicks on Application cards
  // v10 info: when card is clicked (not on the delete button) if the service is an AWS instance,
  // you are redirected to AWSGraphsContainer passing in the state object containing typeOfService
  const handleClick = (
    event: ClickEvent,
    selectedApp: string,
    selectedService: string,
    i: number
  ) => {
    //delRaf refers to the delete button
    if (delRef.current[i] && !delRef.current[i].contains(event.target)) {
      if (
        selectedService === 'AWS' ||
        selectedService === 'AWS/EC2' ||
        selectedService === 'AWS/ECS' ||
        selectedService === 'AWS/EKS'
      ) {
        setAppIndex(i);
        setApp(selectedApp);
        navigate(`/aws/:${app}`, { state: { typeOfService: selectedService } });
      } else {
        setAppIndex(i);
        setApp(selectedApp);
        setServicesData([]);
        setServiceModalOpen(true);
      }
    }
  };

  // Conditional Rendering of UI Modals for Light and Dark Mode
  // Theme, StyleProps
  const useStylesDark = makeStyles<StyleProps>(theme => ({
    // ALL CARDS
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'visible',
      height: 280,
      width: 280,
      textAlign: 'center',
      color: '#888888',
      whiteSpace: 'nowrap',
      backgroundColor: 'lightgray',
      borderRadius: 3,
      border: '0',
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
      '&:hover, &.Mui-focusVisible': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        fontWeight: 600,
      },
    },
    iconbutton: {
      boxShadow: 'none',
      color: 'none',
      visibility: 'hidden',
    },
    btnStyle: {
      position: 'absolute',
      top: -10,
      left: -72,
      margin: '0',
      color: '#eeeeee',
      borderRadius: '0',
      backgroundColor: 'none',
      visibility: 'visible',
    },
    icon: {
      width: '75px',
      height: '75px',
      boxShadow: 'none',
    },

    // ALL CARDS: CONTENT
    fontStyles: {
      fontSize: '18px',
      fontFamily: 'Roboto',
      fontWeight: 300,
      color: '#444d56',
    },
  }));

  const useStylesLight = makeStyles<StyleProps>(theme => ({
    // ALL CARDS
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'visible',
      height: 280,
      width: 280,
      textAlign: 'center',
      color: '#888888',
      whiteSpace: 'nowrap',
      backgroundColor: 'white',
      borderRadius: 3,
      border: '0',
      boxShadow:
        '0 6px 6px 0 rgba(153, 153, 153, 0.14), 0 6px 6px -2px rgba(153, 153, 153, 0.2), 0 6px 8px 0 rgba(153, 153, 153, 0.12)',
      '&:hover, &.Mui-focusVisible': {
        backgroundColor: `#3788fc`,
        color: '#ffffff',
        fontWeight: 600,
      },
    },
    iconbutton: {
      boxShadow: 'none',
      color: 'none',
      visibility: 'hidden',
    },
    btnStyle: {
      position: 'absolute',
      top: -10,
      left: -72,
      margin: '0',
      color: '#eeeeee',
      borderRadius: '0',
      backgroundColor: 'none',
      visibility: 'visible',
    },
    icon: {
      width: '75px',
      height: '75px',
      boxShadow: 'none',
    },
    // ALL CARDS: CONTENT
    fontStyles: {
      fontSize: '18px',
      fontFamily: 'Roboto',
      fontWeight: 300,
      color: '#444d56',
    },
  }));

  const classes = mode === 'light' ? useStylesLight({}) : useStylesDark({});

  // update notification count based on statuscode >= 400
  const notification = commsData
    .filter((item: { responsestatus: number }) => item.responsestatus >= 400)
    .filter((item: { time: string }) => {
      const d1 = new Date(item.time);
      const d2 = new Date(clickedAt);
      return d1 > d2;
    });

  const updateNotification = () => {
    const timestamp = new Date();
    setClickedAt(timestamp.toISOString());
  };

  return (
    <div className="entireArea">
      <div className="dashboardArea">
        <header className="mainHeader">
          <section className="header" id="rightHeader">
            <form className="form" onSubmit={e => e.preventDefault()}>
              <label className="inputContainer">
                <input
                  className="form"
                  id="textInput"
                  placeholder="Search..."
                  onChange={e => setSearchTerm(e.target.value)}
                  type="text"
                  name="search"
                />
                <Search />
                <hr />
              </label>
            </form>

            <div className="dashboardIconWrapper">
              <div className="dashboardIconArea">
                <span className="dashboardTooltip">
                  You have {applications ? applications.length : 0} active databases
                </span>
                <DashboardIcon className="navIcon" id="dashboardIcon" />
              </div>
              <div className="notificationsIconArea">
                <span className="notificationsTooltip">
                  You have {notification ? notification.length : 0} new alerts
                </span>
                <NotificationsIcon className="navIcon" id="notificationsIcon" />
                <Badge
                  overlap="rectangular"
                  badgeContent={notification ? notification.length : 0}
                  color="secondary"
                />
              </div>
              <div className="personIconArea">
                <Button className="personTooltip" onClick={() => setPersonModalOpen(true)}>
                  <PersonIcon className="navIcon" id="personIcon" />
                </Button>
              </div>
            </div>
          </section>
        </header>

        <div className="cardContainer">
          <div className="card" id="card-add">
            <Button className={classes.paper} onClick={() => setEnvModalOpen(true)}>
              <AddCircleOutlineTwoToneIcon className={classes.icon} />
            </Button>
          </div>
          {applications &&
            applications
              .filter((db: any) => db[0].toLowerCase().includes(searchTerm.toLowerCase()))
              .map((application: string[], i: number | any | string | undefined) => (
                <div className="card" key={`card-${i}`} id={`card-${application[1]}`}>
                  <Card
                    key={`card-${i}`}
                    className={classes.paper}
                    variant="outlined"
                    onClick={event => handleClick(event, application[0], application[3], i)}
                  >
                    <div className="databaseIconContainer">
                      <div className="databaseIconHeader">
                        {/* {application[1] === 'SQL' ? (
                          <img className="databaseIcon" alt="SQL" />
                        ) : (
                          <img className="databaseIcon" alt="MongoDB" />
                        )} */}
                      </div>
                    </div>

                    <CardHeader
                      avatar={
                        <IconButton
                          id="iconButton"
                          ref={element => {
                            delRef.current[i] = element;
                          }}
                          className={classes.iconbutton}
                          aria-label="Delete"
                          onClick={event => confirmDelete(event, application[0], i)}
                        >
                          <HighlightOffIcon
                            className={classes.btnStyle}
                            id="deleteIcon"
                            ref={element => {
                              delRef.current[i] = element;
                            }}
                          />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      {/* <p id="databaseName">Name:</p> */}
                      <Typography noWrap id="databaseName" className={classes.fontStyles}>
                        {application[0]}
                      </Typography>
                      <p id="serviceName">Service:</p>
                      <Typography className={classes.fontStyles}>{application[3]}</Typography>
                    </CardContent>
                    <hr className="cardLine" />

                    <div className="cardFooter">
                      <UpdateIcon className="cardFooterIcon" />
                      <em>
                        <p id="cardFooterText">{application[4]}</p>
                      </em>
                    </div>
                  </Card>
                </div>
              ))}
          <Modal open={envModalOpen} onClose={() => setEnvModalOpen(false)}>
            <EnvModal
              setOpen={setEnvModalOpen}
              setAwsModalOpen={setAwsModalOpen}
              setAddModalOpen={setAddModalOpen}
            />
          </Modal>

          <Modal open={awsModalOpen} onClose={() => setAwsModalOpen(false)}>
            <AwsModal setOpen={setAwsModalOpen} />
          </Modal>

          <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
            <AddModal setOpen={setAddModalOpen} />
          </Modal>

          <Modal open={personModalOpen} onClose={() => setPersonModalOpen(false)}>
            <ProfileContainer setOpen={setPersonModalOpen} />
          </Modal>

          <Modal open={serviceModalOpen} onClose={() => setServiceModalOpen(false)}>
            <ServicesModal key={`key-${appIndex}`} i={appIndex} app={app} />
          </Modal>
        </div>
      </div>
    </div>
  );
});

export default Occupied;
