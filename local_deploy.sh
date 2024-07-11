dfx identity use default

dfx nns install

dfx canister create water_neuron --specified-id n76cn-tyaaa-aaaam-acc5a-cai
dfx canister create nicp_ledger --specified-id ny7ez-6aaaa-aaaam-acc5q-cai
dfx canister create wtn_ledger --specified-id bkyz2-fmaaa-aaaaa-qaaaq-cai
dfx canister create internet_identity --specified-id bd3sg-teaaa-aaaaa-qaaba-cai

dfx deploy water_neuron --argument '(variant {Init=record{nicp_ledger_id=principal "ny7ez-6aaaa-aaaam-acc5q-cai"; minimum_withdraw_amount_e8s=0:nat64}})' --mode reinstall -y
dfx deploy nicp_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "NICP"; token_name = "Neuron Internet Computer"; metadata = vec {}; initial_balances = vec {}; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'
dfx deploy wtn_ledger --argument '(variant { Init = record { minting_account = record { owner = principal "n76cn-tyaaa-aaaam-acc5a-cai" }; feature_flags  = opt record { icrc2 = true }; decimals = opt 8; max_memo_length = opt 80; transfer_fee = 10_000; token_symbol = "NICP"; token_name = "Neuron Internet Computer"; metadata = vec {}; initial_balances = vec {}; archive_options = record { num_blocks_to_archive = 1000; trigger_threshold = 2000; max_message_size_bytes = null; cycles_for_archive_creation = opt 1_000_000_000; node_max_memory_size_bytes = opt 3_221_225_472; controller_id = principal "mf7xa-laaaa-aaaar-qaaaa-cai"; } }})'

dfx deploy internet_identity

dfx generate

dfx identity use icp-ident-RqOPnjj5ERjAEnwlvfKw

# dfx ledger transfer --memo 0 --icp 1_500 address
