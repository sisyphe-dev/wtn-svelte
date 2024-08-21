dfx identity use default
minter_id="$(dfx identity get-principal)"

dfx nns install

export water_neuron_id="n76cn-tyaaa-aaaam-acc5a-cai"
export nicp_ledger_id="ny7ez-6aaaa-aaaam-acc5q-cai"
export icp_ledger_id="ryjl3-tyaaa-aaaaa-aaaba-cai"
export wtn_ledger_id="jcmow-hyaaa-aaaaq-aadlq-cai"
export internet_identity_id="iidmm-fiaaa-aaaaq-aadmq-cai"
export boomerang_id="daijl-2yaaa-aaaar-qag3a-cai"
export swap_pool_id="e5a7x-pqaaa-aaaag-qkcga-cai"

dfx canister create water_neuron --specified-id $water_neuron_id
dfx canister create nicp_ledger --specified-id $nicp_ledger_id
dfx canister create wtn_ledger --specified-id $wtn_ledger_id
dfx canister create boomerang --specified-id $boomerang_id
dfx canister create swap_pool --specified-id $swap_pool_id
dfx canister create internet_identity --specified-id $internet_identity_id

dfx deploy swap_pool --argument "(record {address= \"$nicp_ledger_id\"; standard= \"ICRC2\";}, record {address= \"$icp_ledger_id\"; standard= \"ICP\"; }, principal \"$water_neuron_id\", principal \"$water_neuron_id\", principal \"$water_neuron_id\")"
dfx deploy water_neuron --argument "(variant{Init=record{nicp_ledger_id=principal \"$nicp_ledger_id\"; wtn_ledger_id=principal \"$wtn_ledger_id\"; wtn_governance_id=principal \"$wtn_ledger_id\"}})"
dfx deploy nicp_ledger --argument "(variant { Init = record { minting_account = record { owner = principal \"$water_neuron_id\" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = \"NICP\"; token_name = \"Neuron Internet Computer\"; metadata = vec {}; initial_balances = vec {} ; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal \"mf7xa-laaaa-aaaar-qaaaa-cai\"; } }})"
dfx deploy wtn_ledger --argument "(variant { Init = record { minting_account = record { owner = principal \"$water_neuron_id\" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = \"WTN\"; token_name = \"Water Neuron\"; metadata = vec {}; initial_balances = vec {}; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal \"mf7xa-laaaa-aaaar-qaaaa-cai\"; } }})"
dfx deploy boomerang --argument "(record { water_neuron_id = principal \"$water_neuron_id\"; nicp_ledger_id = principal \"$nicp_ledger_id\"; wtn_ledger_id = principal \"$wtn_ledger_id\"; icp_ledger_id = principal \"$icp_ledger_id\" })"
dfx deploy internet_identity

dfx identity use icp-ident-RqOPnjj5ERjAEnwlvfKw

# water neuron account id: 0be44491707d4b564caa515730dca79f70837811dd6202b2f498b26f4e59a01c
dfx ledger transfer --memo 0 --icp 3 0be44491707d4b564caa515730dca79f70837811dd6202b2f498b26f4e59a01c

dfx identity use default