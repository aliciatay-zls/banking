import Link from "next/link";
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCardIcon from '@mui/icons-material/AddCard';
import CircleIcon from '@mui/icons-material/Circle';
import { DataGrid } from '@mui/x-data-grid';

import DefaultLayout from "../../components/defaultLayout";
import serverSideProps from "../../src/serverSideProps";

export async function getServerSideProps(context) {
    const finalProps = await serverSideProps(context);
    if (!finalProps.props) {
        return finalProps;
    }

    const customerRows = [];
    finalProps.props.responseData.map((cus) => {
        customerRows.push({
            id: cus["customer_id"].toString(),
            fullName: cus["full_name"],
            dob: cus["date_of_birth"],
            city: cus["city"],
            zipcode: cus["zipcode"],
            status: cus["status"],
        })
    });

    return {
        props: {
            customerRows: customerRows,
        }
    };
}

const columns = [
    {
        field: 'id',
        headerName: 'ID',
        flex: 0.5,
        minWidth: 90,
        editable: false,
    },
    {
        field: 'fullName',
        headerName: 'Full Name',
        flex: 1,
        minWidth: 150,
        editable: false,
        renderCell: (params) =>
            <span>
                <Link href={`/customers/${params.row.id}`}>
                    <Tooltip title="View profile">
                        <IconButton size="small">
                            <AccountCircleIcon/>
                        </IconButton>
                    </Tooltip>
                </Link>
                {params.value}
            </span>
        ,
    },
    {
        field: 'dob',
        headerName: 'DOB',
        flex: 0.5,
        minWidth: 100,
        editable: false,
        type: 'date',
        valueGetter: ({value}) => value && new Date(value),
    },
    {
        field: 'city',
        headerName: 'City',
        flex: 1,
        minWidth: 150,
        editable: false,
    },
    {
        field: 'zipcode',
        headerName: 'Zip',
        flex: 0.5,
        minWidth: 80,
        editable: false,
    },
    {
        field: 'status',
        headerName: 'Status',
        flex: 0.5,
        minWidth: 110,
        editable: false,
        renderCell: ({value}) =>
            <span>
                <CircleIcon color={value === 'active' ? "success" : "error"} sx={{height: 10}}/>
                {value}
            </span>
        ,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        minWidth: 110,
        type: 'actions',
        getActions: ({row}) => [
            <span>
                <Link href={`/customers/${row.id}/account`}>
                    <Tooltip title="Transact on behalf">
                        <IconButton size="small">
                            <AccountBalanceIcon/>
                        </IconButton>
                    </Tooltip>
                </Link>
            </span>,
            <span>
                <Link href={`/customers/${row.id}/account/new`}>
                    <Tooltip title="Create new account">
                        <IconButton size="small">
                            <AddCardIcon/>
                        </IconButton>
                    </Tooltip>
                </Link>
            </span>,
        ],
    },
];

export default function CustomersPage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            isPossibleTOB={false}
            tabTitle={"Home"}
            headerTitle={"All Customers"}
        >
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={props.customerRows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Box>
        </DefaultLayout>
    );
}
