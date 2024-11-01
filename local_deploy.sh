dfx identity use default

dfx extension run nns install

dfx canister create water_neuron --specified-id n76cn-tyaaa-aaaam-acc5a-cai
dfx canister create nicp_ledger --specified-id ny7ez-6aaaa-aaaam-acc5q-cai
dfx canister create wtn_ledger --specified-id jcmow-hyaaa-aaaaq-aadlq-cai
dfx canister create internet_identity --specified-id iidmm-fiaaa-aaaaq-aadmq-cai
dfx canister create boomerang --specified-id daijl-2yaaa-aaaar-qag3a-cai

dfx deploy water_neuron --argument '(variant{Init=record{nicp_ledger_id=principal "ny7ez-6aaaa-aaaam-acc5q-cai"; wtn_ledger_id=principal "jcmow-hyaaa-aaaaq-aadlq-cai"; wtn_governance_id=principal "jcmow-hyaaa-aaaaq-aadlq-cai"}})'
dfx deploy nicp_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "NICP"; token_name = "Neuron Internet Computer"; metadata = vec {}; initial_balances = vec {} ; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'
dfx deploy wtn_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "WTN"; token_name = "Water Neuron"; metadata = vec {}; initial_balances = vec {}; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'
dfx deploy boomerang --argument '(record { water_neuron_id= principal "n76cn-tyaaa-aaaam-acc5a-cai"; nicp_ledger_id= principal "ny7ez-6aaaa-aaaam-acc5q-cai"; wtn_ledger_id= principal "jcmow-hyaaa-aaaaq-aadlq-cai"; icp_ledger_id= principal "ryjl3-tyaaa-aaaaa-aaaba-cai"})'
dfx deploy internet_identity

# WaterNeuron canister requires 3 ICP to set up.
# WaterNeuron account id: 0be44491707d4b564caa515730dca79f70837811dd6202b2f498b26f4e59a01c
dfx ledger transfer --memo 0 --icp 3 0be44491707d4b564caa515730dca79f70837811dd6202b2f498b26f4e59a01c
