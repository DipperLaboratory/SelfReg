import React, {useState} from 'react';
import './App.css';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    createStyles,
    makeStyles, Snackbar,
    TextField,
    Theme,
    Typography
} from '@material-ui/core';
import MuiAlert, {AlertProps} from '@material-ui/lab/Alert';
import {Octokit} from "@octokit/rest";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            textAlign: 'center'
        },
        pd: {
            paddingBottom: theme.spacing(2),
        }
    }),
);

function App() {
    const classes = useStyles();

    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const [helperMsg, setHelperMsg] = useState<string>('请输入您的校园邮箱');
    const [showTip, setShowTip] = useState<boolean>(false);
    const [tipMsg, setTipMsg] = useState<string>('');
    const [pending, setPending] = useState<boolean>(false);

    const testRe = new RegExp('@jgsu.edu.cn$');

    const octokit = new Octokit({
        baseUrl: "https://auth.github.learningman.top/safe"
    })

    function update(event: React.ChangeEvent<HTMLTextAreaElement>): void {
        const value = event.target.value;
        setEmail(() => value);
        const err = !testRe.test(value);
        if (err) {
            setHelperMsg('请使用 @jgsu.edu.cn');
            setError(() => true);
        } else {
            if (value.split('@')[0].length === 10) {
                setHelperMsg('格式正确');
                setError(() => false)
            } else {
                setHelperMsg('学号应为10位')
                setError(() => true)
            }
        }

    }

    function submit(): void {
        if (!email) {
            setHelperMsg('请输入邮箱');
            setError(true);
            return;
        }
        if (error) {
            return;
        }
        if (email.split('@')[0].length !== 10) {
            setHelperMsg('请检查邮箱前缀');
            setError(true);
            return;
        }
        setPending(true);
        octokit.rest.orgs.createInvitation({
            org: 'DipperLaboratory',
            email: email
        }).then((resp) => {
            setPending(false);
            setTipMsg(`邀请已发送至 ${email}`);
            setShowTip(true);
        })
    }

    function Alert(props: AlertProps) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowTip(false);
    };

    return (
        <div className={classes.root}>
            <Snackbar open={showTip} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success">
                    {tipMsg}
                </Alert>
            </Snackbar>
            <header className="App-header">
                <Card style={{minWidth: 350}}>
                    <CardContent style={{margin: "24px"}}>
                        <Typography gutterBottom variant="h5" component="h2" className={classes.pd}>北斗注册</Typography>
                        <TextField id="outlined-basic" label="Email" variant="outlined"
                                   value={email}
                                   error={error}
                                   InputLabelProps={{
                                       shrink: true,
                                   }}
                                   helperText={helperMsg}
                                   onChange={update}
                                   style={{width: "100%"}} className={classes.pd}/>
                        <Button variant="contained" disableElevation onClick={submit}>
                            {pending ? <CircularProgress style={{maxHeight: "24.5px", maxWidth: "24.5px"}}/> : "提交"}
                        </Button>
                    </CardContent>
                </Card>
            </header>
        </div>
    );
}

export default App;
