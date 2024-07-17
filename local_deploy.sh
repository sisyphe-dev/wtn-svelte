dfx identity use default

dfx nns install

cp /Users/ulyssekaz/sisyphe/wtn_svelte/wasm/governance-canister_test.wasm /Users/ulyssekaz/.cache/dfinity/versions/0.16.1/wasms/governance-canister_test.wasm
cp /Users/ulyssekaz/sisyphe/wtn_svelte/wasm/governance-canister_test.wasm /Users/ulyssekaz/.cache/dfinity/versions/0.16.1/wasms/governance-canister.wasm

dfx canister create water_neuron --specified-id n76cn-tyaaa-aaaam-acc5a-cai
dfx canister create nicp_ledger --specified-id ny7ez-6aaaa-aaaam-acc5q-cai
dfx canister create wtn_ledger --specified-id jcmow-hyaaa-aaaaq-aadlq-cai
dfx canister create internet_identity --specified-id bd3sg-teaaa-aaaaa-qaaba-cai

dfx deploy water_neuron --argument '(variant{Init=record{nicp_ledger_id=principal "ny7ez-6aaaa-aaaam-acc5q-cai"; wtn_ledger_id=principal "jcmow-hyaaa-aaaaq-aadlq-cai"; wtn_governance_id=principal "jcmow-hyaaa-aaaaq-aadlq-cai"}})' --mode reinstall -y
dfx deploy nicp_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "NICP"; token_name = "Neuron Internet Computer"; metadata = vec {}; initial_balances = vec {} ; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'
dfx deploy wtn_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "WTN"; token_name = "Water Neuron"; metadata = vec {}; initial_balances = vec {}; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'

dfx deploy internet_identity

dfx identity use icp-ident-RqOPnjj5ERjAEnwlvfKw

# dfx ledger transfer --memo 0 --icp 1_00_000 3649a972346629c3ffc64456a86dafa7c4d729f69f6d2f588e3a6e36a72cb3b5

#water neuron account id: 0be44491707d4b564caa515730dca79f70837811dd6202b2f498b26f4e59a01c


didc encode -d rs/rosetta-api/icrc1/ledger/ledger.did -t '(InitArgs)' '(record { 
    minting_account = record { 
        owner = principal "tsbvt-pyaaa-aaaar-qafva-cai" 
    }; 
    fee_collector_account = opt record { 
            owner = principal "jfnic-kaaaa-aaaaq-aadla-cai"; 
    }; 
    transfer_fee = 10_000; 
    token_symbol = "nICP"; 
    token_name = "neuron ICP"; 
    metadata = vec { 
        record { 
            "icrc1:logo"; 
                variant { Text = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAACXBIWXMAAAsTAAALEwEAmpwYAAADAFBMVEVHcEzxz9fwsrvw0NF9hpbo3eHk4Obg5u3BydE4QVt2fJD3IjRugY7zvLhXXXYZKkfyi5vzMUKHmqVdb3+tvMJET2klMU1AVmj4gXX8fGP4YmP3jocNCy/5M06dq7UWGDryc4Jpc4bzq6WlsL1UangqOFGepLX3p5n6aV2C2rb2PmP0d4b8UUf4EzkaJURAVGjwFTz1sqX2sKf5mIP6jnn6UlH0fXn/2uxd1pMzm2b2XX7/ACv/AC3vAy7/ACn/ATD/Bi//DC3/GzEAgDv/FC7zASwAjT/3AS0BjkXsAy/fBi7+AAf/MjUDJDgAABstHzb8ASz/Dy9PHjcCHjbqAS4AhToXIDckITcAtUkBXDz/PDf/ODduGjQBokz/QTr/JDI1HTX/ABQAxU7HBi1YGzd6FTKcDjEAiToAABEAaUABhkT6ACQANjlIHjaFFDP//v//ACL/KjW7DTEAr0sALDdAHDYAKCzUBy4BdDmOEzRhGDTxACADDTA0DC7/JiMDASf/PSz/GRXsABcAmEYAxlkY0W//MS3rAAyYACz1ACMBy2J4Izf/FyBu9rIAhFECm1DlASoAv1LNBS2lAiwZEjLzAA0ACx0O/n9NDDH/UDiVGzT/1N+IJDf/LE5l7KZC3o3/xtcBqlP/Bx0AtFnMEjGwGDIA0VbsACe9ITUAeT5oGzSuCjDkCzAuL0ADSDz+ZU2kIDUAGSMBWkoAu0p+BC7jHjT/6e/1//tdIjfK/+8AQDSHAiyRCDH5ABS9ACfCFjHrHzIaTkoGZ08Aj1kGT0HzETME1GQAeUzHJzXXJjSYJDdCDjKtKTYfBy///vH/MCPk//b+SGhrBS6M/8b/rr7/ChP/QzCl/9a3/+P/dI0AQSH/3utU5pr/XXf/hJwAFhLpAAUk3IEAtk8A3nhcMj2oDTIAvWMDUFdfBTAArF8A104SoWzQ//UANRhJ45TmAAUAxT3/l63/vM9ALjsA7m8SNDwRRVf/kKUAdB+F7rCG977lAAwAUST6NToniG6yJDc85XsBAAAAO3RSTlMAMVU+ZCEXBxO6cv5NapTjffwtdjGt13zM9MKw898k5pSJhjyDy0ir53TFnff545fylozP3eig3NnFol9j4vsAAAanSURBVFjD7ZZXXBtXFsZjTOwAjjfum8Rpm7Kbtsn2ckczo5FGXagiWV2gYlRBQiALI7rppjdTgwHTMcZgY9PBvfde4t6STc/2TYZf9iHxYkD4ZR/yvc3D9//NPec7954nnvhR//96+bk5j+V/Ounos4/jnydPU2/41WMAnk9Sq9Wbn5y1f248RyFXn/nNrAG/y/l3tn6/esPTs/Q/k8Sx773RwTnz7PzZVTAtnlMhy/tCrjjz81kBnjvtcCj0hxep5fLNc2fh9zuN9To4B4RyDked+NtZABZt7BJlc6qEnJsd+2ZTx7dDsX19tq4D2e7cGzyFfPNTPvrnbCRjmMZRJTrQa91VJVck+lrHF0IFGMYVaqS2vq4RhVyu2OBbHZ9ho+gQtUqvaRYdOlSlaNgvT/NpqOblRJJ4Yx1UDKuQOpqbq7rvHFIk/tqXCLDRIlPZ+FBFRaMtqBnjfnlDy0nbMPOh8gsFZJa1Zaegq7XRNtKqEZpk2QrO0Z/O1D8/KBQlC9CMg9nDw41aTLNPandyOApO4kzD8DYbgtFGpUAg5AqcEmy/6JBjv8OBadI2z2yo5oRabo66WVyhQKCP9iZ4ud9oWkWafaM3g+Kfn2EEWKYsrg41NMDDou7/fB2nwbCuZtHt7va0xLkzigCEKLUeoUSrtR+W7Slb/7XXruwTKqMrHI74X0zvf9ISmZ+PAEirdHtEItUqVdmDBGl2A4ZRC0c4mvifTQt4i63rHtPB0R4Qy4SKzWFR9013qVQsutcwPjqiiVdPFwY/NijKHR9ChAhdogPFLrPKJFIKqDZuryG3kzoSlDNNGOa/O4gg/cVtSCwEw2IerzxOVCyU9CkryAKBl6oRZWPxflMC/sxGmnAIjz6YUIQOcO0IohS1I6hHot8tGDhs7NP3YjnvTBWGOYOwbtdoIbjb+eBOsdSpa2U1SFCms9HO43l3PbjjxTBlc9JUYXhhEDlx73acVxRVVuaC6Xats4GHRFuVKFxkLSi7JhJKuVLq0blTRIDEd0ulujaX6n6B1YjkQ4iRB91SIiSm2Lrq/nWJezi2kZrzyDDMy1xLwoniAVuxtcVabuONj1rapAgEIVwXeqLTbOV5dpOpmCDpUWF4q4RJQliWdokSzojrAYC7ZyyTxdWzAKTXovq4E8VGp543TKXmJE4eBr8SMRMZGhsrtvMB0OrwtsLyfuDktfKERgQy2GIFrK8OMCUVZCr59ORheD+ZAGTk5uoglwGKNbZrAXEaiRSGDFqtUIKyDEN5uYUQmUwVkJMmC8PL6WImE8f7+yHQdgu0GuCBnnw7L5bXcQuGSBIj0U1Jh5CEEleNgLzxnUki8EkTARCTAMANHjqs9Lj33ouLLYR2lXXz3UIp6uGiNjFosPHJBAFl//5/AH9Y9EkTk0AwAZPLFcM9AyyZuajQDn1l/gKSfHmvyBkNGXjG9mgWSogdeerh3evNv0ec/+fEIZgkulsMWN6DSFsG5NTlR/cbEalq7wAAwO1yiQEfQiLZ1Rd3/PGhCER9WhPx+aIPkwmCGALAe3s8AwA6sBw0Ag+ddbcHJemJysbSARTJtlyJOLvn0zd/4P/T3+rD1p2L+Gz3BEKMg3KGqQjgYGBvN8ziuol2wCwXlwAT9sHLF49d2pSVQlv6PUDgxxRKXkFY7Y6Ivwalpzcx6cyeDAjH4fL63HydVswnBApZfDiUbblcuf0fezbVp6guvPb9ayDw6poQSl1Y6qUdEaeON32YbIEBjuN8VvkJOgT4dEL8yFD2YPWVbdtPrtuUmsdI+XjZD8faP/xfNAqjPiy19mzExc+Ok5LT05PXro2MhOm4JTNzsKSkJLP6/AcRH60n7HWMlJarCx9u4xsrr7aspjDqtoatqzm3fdvnVy5Xv4vjayeE764+fv5U5ZGPTtZmhRXUMWiMC8GBk8xiQPgFSgjFrLpOMP5y8tyxI9suVn5AqLJy25FjO87WXCPc9Xk0GkMW/tKrkw6D/8rwnWtCQkIYqqitBalZ62ov1awnVHOp9lpWasHW63V5DBrNLCsNXvioW23ewoTwGFlLyOoQWopKFRW16r+6HlWnmjDTzC2dwcEBr071rLyyMrzUKpv4j5DVNLOZQYgw0lYTopg6t4QnLHtjuuXEPyAuODhmp8xkWtNC+U4ta0yynTGl4QnLX1k6k9f1Rf9lvyQgwaVbtsTExLhitpQSHwkvBQQu9WHJeXHBkoUBry//CaHlrwe8t8R/sc8L91OLF/gHrljx2ool/gsW+7pm/iif9C3dIrDeH6WmfwAAAABJRU5ErkJggg==" 
                }
        } 
    }; 
    initial_balances = vec {}; 
    archive_options = record { 
        num_blocks_to_archive = 1000; 
        trigger_threshold = 2000; 
        max_message_size_bytes = null; 
        cycles_for_archive_creation = opt 10_000_000_000_000; 
        node_max_memory_size_bytes = opt 3_221_225_472; 
        controller_id = principal "jmod6-4iaaa-aaaaq-aadkq-cai";
    }
})'
